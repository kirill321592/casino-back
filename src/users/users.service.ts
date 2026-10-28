import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { env } from '../common/config/env';
import {
  defaultLimits,
  formatMoney,
  PlayLimits,
  selfExclusionMessage,
  settlePending,
  utcDay,
} from '../responsible-gaming/limits';
import { User, UserProfile } from './users.types';

/**
 * The account store, in memory for now — a restart wipes every player. Swapping
 * the two Maps for a database is the only change this file needs; nothing else
 * touches user records directly.
 *
 * Balance lives here rather than on the client because it is money: the games
 * ask this service to move it, and the client only ever learns the result. For
 * the same reason the player's own limits are enforced here — every stake from
 * every game passes through `debit`, so there is no game that can forget to ask.
 */
@Injectable()
export class UsersService {
  private readonly byId = new Map<string, User>();
  /** Lower-cased username -> id, so sign-up cannot mint two "Ada"s. */
  private readonly idByUsername = new Map<string, string>();

  create(username: string, passwordHash: string, termsVersion: string): User {
    const key = username.toLowerCase();
    if (this.idByUsername.has(key)) {
      throw new ConflictException('That username is already taken');
    }

    const now = new Date();
    const user: User = {
      id: randomUUID(),
      username,
      passwordHash,
      balance: env.startingBalance,
      createdAt: now.toISOString(),
      termsAcceptedAt: now.toISOString(),
      termsVersion,
      limits: defaultLimits(),
      lossToday: { day: utcDay(now), amount: 0 },
      selfExcludedUntil: null,
    };
    this.byId.set(user.id, user);
    this.idByUsername.set(key, user.id);
    return user;
  }

  findById(id: string): User | undefined {
    return this.byId.get(id);
  }

  findByUsername(username: string): User | undefined {
    const id = this.idByUsername.get(username.toLowerCase());
    return id === undefined ? undefined : this.byId.get(id);
  }

  /**
   * Takes a stake off the balance. Refuses to go negative, to stake during a
   * self-exclusion, or to carry the day's net loss past the player's limit.
   * Returns the new balance.
   */
  debit(id: string, amount: number): number {
    const user = this.require(id);
    const now = new Date();

    if (this.isSelfExcluded(user, now)) {
      throw new ForbiddenException(selfExclusionMessage(user.selfExcludedUntil!));
    }

    const limit = this.getLimits(id, now).dailyLossLimit;
    const lossToday = this.rollDay(user, now);
    if (limit !== null && lossToday.amount + amount > limit) {
      throw new BadRequestException(
        `That bet would take you past your daily loss limit of ${formatMoney(limit)}. ` +
          'It resets at midnight UTC.',
      );
    }

    if (user.balance < amount) throw new BadRequestException('Not enough balance for that bet');

    user.balance -= amount;
    lossToday.amount += amount;
    return user.balance;
  }

  /** Pays winnings in. Returns the new balance. */
  credit(id: string, amount: number): number {
    const user = this.require(id);
    user.balance += amount;
    this.rollDay(user, new Date()).amount -= amount;
    return user.balance;
  }

  getBalance(id: string): number {
    return this.byId.get(id)?.balance ?? 0;
  }

  /** Net loss so far today; zero once the player is ahead. */
  getLossToday(id: string): number {
    return Math.max(0, this.rollDay(this.require(id), new Date()).amount);
  }

  /** The limits in force at `now`, with any pending change that has come due applied. */
  getLimits(id: string, now = new Date()): PlayLimits {
    const user = this.require(id);
    user.limits = settlePending(user.limits, now);
    return user.limits;
  }

  setLimits(id: string, limits: PlayLimits): void {
    this.require(id).limits = limits;
  }

  /** Starts a self-exclusion. Never shortens one already running. */
  selfExclude(id: string, until: Date): void {
    const user = this.require(id);
    const current = user.selfExcludedUntil ? Date.parse(user.selfExcludedUntil) : 0;
    if (until.getTime() > current) user.selfExcludedUntil = until.toISOString();
  }

  isSelfExcluded(user: User, now = new Date()): boolean {
    return user.selfExcludedUntil !== null && Date.parse(user.selfExcludedUntil) > now.getTime();
  }

  toProfile({ id, username, balance }: User): UserProfile {
    return { id, username, balance };
  }

  /* The ledger is per UTC day; the first touch of a new day starts it from zero. */
  private rollDay(user: User, now: Date): User['lossToday'] {
    const day = utcDay(now);
    if (user.lossToday.day !== day) user.lossToday = { day, amount: 0 };
    return user.lossToday;
  }

  private require(id: string): User {
    const user = this.byId.get(id);
    if (!user) throw new BadRequestException('Unknown player');
    return user;
  }
}

import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { env } from '../common/config/env';
import { User, UserProfile } from './users.types';

/**
 * The account store, in memory for now — a restart wipes every player. Swapping
 * the two Maps for a database is the only change this file needs; nothing else
 * touches user records directly.
 *
 * Balance lives here rather than on the client because it is money: the games
 * ask this service to move it, and the client only ever learns the result.
 */
@Injectable()
export class UsersService {
  private readonly byId = new Map<string, User>();
  /** Lower-cased username -> id, so sign-up cannot mint two "Ada"s. */
  private readonly idByUsername = new Map<string, string>();

  create(username: string, passwordHash: string): User {
    const key = username.toLowerCase();
    if (this.idByUsername.has(key)) {
      throw new ConflictException('That username is already taken');
    }

    const user: User = {
      id: randomUUID(),
      username,
      passwordHash,
      balance: env.startingBalance,
      createdAt: new Date().toISOString(),
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

  /** Takes a stake off the balance, refusing to go negative. Returns the new balance. */
  debit(id: string, amount: number): number {
    const user = this.require(id);
    if (user.balance < amount) throw new BadRequestException('Not enough balance for that bet');

    user.balance -= amount;
    return user.balance;
  }

  /** Pays winnings in. Returns the new balance. */
  credit(id: string, amount: number): number {
    const user = this.require(id);
    user.balance += amount;
    return user.balance;
  }

  getBalance(id: string): number {
    return this.byId.get(id)?.balance ?? 0;
  }

  toProfile({ id, username, balance }: User): UserProfile {
    return { id, username, balance };
  }

  private require(id: string): User {
    const user = this.byId.get(id);
    if (!user) throw new BadRequestException('Unknown player');
    return user;
  }
}

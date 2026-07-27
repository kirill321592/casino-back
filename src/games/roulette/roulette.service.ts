import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { env } from '../../common/config/env';
import { RngService } from '../../common/rng/rng.service';
import { PlaceBetDto } from './dto/place-bet.dto';
import {
  OUTSIDE_MULTIPLIER,
  POCKET_COUNT,
  RED_NUMBERS,
  STRAIGHT_MULTIPLIER,
} from './roulette.constants';
import { Bet, BetType, Round, RoundResult, RoundState } from './roulette.types';

@Injectable()
export class RouletteService {
  private round: Round = this.createRound();
  private bets: Bet[] = [];

  constructor(private readonly rng: RngService) {}

  getState(): RoundState {
    return {
      id: this.round.id,
      status: this.round.status,
      closesAt: new Date(this.round.closesAt).toISOString(),
      betsCount: this.bets.length,
    };
  }

  placeBet(playerId: string, bet: PlaceBetDto): Bet {
    if (this.round.status !== 'betting' || bet.roundId !== this.round.id) {
      throw new Error('This round is closed');
    }
    if (bet.type === BetType.STRAIGHT && bet.number === undefined) {
      throw new Error('A straight bet needs a number');
    }

    const placedBet: Bet = { playerId, type: bet.type, amount: bet.amount, number: bet.number };
    this.bets.push(placedBet);
    return placedBet;
  }

  spin(): RoundResult {
    this.round.status = 'spinning';
    const number = this.rng.int(POCKET_COUNT);
    const payouts = this.bets.reduce<Record<string, number>>((result, bet) => {
      const multiplier = this.getMultiplier(bet, number);
      if (multiplier) result[bet.playerId] = (result[bet.playerId] ?? 0) + bet.amount * multiplier;
      return result;
    }, {});
    return { number, payouts };
  }

  startNextRound(): RoundState {
    this.bets = [];
    this.round = this.createRound();
    return this.getState();
  }

  private createRound(): Round {
    return { id: randomUUID(), status: 'betting', closesAt: Date.now() + env.roundDurationMs };
  }

  private getMultiplier(bet: Bet, number: number): number {
    if (bet.type === BetType.STRAIGHT) return bet.number === number ? STRAIGHT_MULTIPLIER : 0;
    if (number === 0) return 0;
    if (bet.type === BetType.RED) return RED_NUMBERS.has(number) ? OUTSIDE_MULTIPLIER : 0;
    if (bet.type === BetType.BLACK) return !RED_NUMBERS.has(number) ? OUTSIDE_MULTIPLIER : 0;
    if (bet.type === BetType.EVEN) return number % 2 === 0 ? OUTSIDE_MULTIPLIER : 0;
    return number % 2 === 1 ? OUTSIDE_MULTIPLIER : 0;
  }
}

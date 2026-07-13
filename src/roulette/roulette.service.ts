import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PlaceBetDto } from './dto/place-bet.dto';
import { Bet, BetType, RoundState } from './types/roulette.types';

const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

@Injectable()
export class RouletteService {
  private readonly roundDurationMs = Number(process.env.ROUND_DURATION_MS) || 15_000;
  private round = this.createRound();
  private bets: Bet[] = [];

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

  spin(): { number: number; payouts: Record<string, number> } {
    this.round.status = 'spinning' as any;
    const number = Math.floor(Math.random() * 37);
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

  private createRound() {
    return { id: randomUUID(), status: 'betting' as const, closesAt: Date.now() + this.roundDurationMs };
  }

  private getMultiplier(bet: Bet, number: number): number {
    if (bet.type === BetType.STRAIGHT) return bet.number === number ? 36 : 0;
    if (number === 0) return 0;
    if (bet.type === BetType.RED) return RED_NUMBERS.has(number) ? 2 : 0;
    if (bet.type === BetType.BLACK) return !RED_NUMBERS.has(number) ? 2 : 0;
    if (bet.type === BetType.EVEN) return number % 2 === 0 ? 2 : 0;
    return number % 2 === 1 ? 2 : 0;
  }
}

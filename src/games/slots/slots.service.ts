import { Injectable } from '@nestjs/common';
import { RngService } from '../../common/rng/rng.service';
import { REEL_COUNT, SLOT_SYMBOLS } from './slots.constants';
import { SlotsPaytable, SpinResult } from './slots.types';

@Injectable()
export class SlotsService {
  constructor(private readonly rng: RngService) {}

  getPaytable(): SlotsPaytable {
    return {
      reelCount: REEL_COUNT,
      symbols: SLOT_SYMBOLS.map(({ symbol, payout3, payout2 }) => ({ symbol, payout3, payout2 })),
    };
  }

  spin(bet: number): SpinResult {
    const reels = Array.from(
      { length: REEL_COUNT },
      () => this.rng.pickWeighted(SLOT_SYMBOLS, (entry) => entry.weight).symbol,
    );
    const multiplier = this.getMultiplier(reels);
    return { reels, bet, multiplier, winnings: multiplier * bet };
  }

  /** Pays the best matching line: three of a kind, otherwise a pair. */
  private getMultiplier(reels: string[]): number {
    const counts = new Map<string, number>();
    for (const symbol of reels) counts.set(symbol, (counts.get(symbol) ?? 0) + 1);

    let best = 0;
    for (const [symbol, count] of counts) {
      if (count < 2) continue;
      const def = SLOT_SYMBOLS.find((entry) => entry.symbol === symbol);
      if (!def) continue;
      best = Math.max(best, count >= 3 ? def.payout3 : def.payout2);
    }
    return best;
  }
}

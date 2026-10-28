import { Injectable } from '@nestjs/common';
import { RngService } from '../../common/rng/rng.service';
import { UsersService } from '../../users/users.service';
import { REEL_COUNT, SLOT_SYMBOLS } from './slots.constants';
import { lineMultiplier, theoreticalRtp } from './slots.math';
import { SlotsPaytable, SpinResult } from './slots.types';

/* Fixed by the paytable, so worked out once rather than per request. */
const RTP = theoreticalRtp();

@Injectable()
export class SlotsService {
  constructor(
    private readonly rng: RngService,
    private readonly users: UsersService,
  ) {}

  getPaytable(): SlotsPaytable {
    return {
      reelCount: REEL_COUNT,
      rtp: RTP,
      symbols: SLOT_SYMBOLS.map(({ symbol, payout3, payout2 }) => ({
        symbol,
        payout3,
        payout2,
      })),
    };
  }

  /**
   * The stake comes off first, so a player who cannot cover the bet never sees
   * a reel — and a losing spin cannot be replayed into credit by a client that
   * simply ignores the answer.
   */
  spin(userId: string, bet: number): SpinResult {
    const staked = this.users.debit(userId, bet);

    const reels = Array.from(
      { length: REEL_COUNT },
      () => this.rng.pickWeighted(SLOT_SYMBOLS, (entry) => entry.weight).symbol,
    );
    const multiplier = lineMultiplier(reels);
    const winnings = multiplier * bet;

    return {
      reels,
      bet,
      multiplier,
      winnings,
      balance: winnings > 0 ? this.users.credit(userId, winnings) : staked,
    };
  }
}

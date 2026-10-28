import { SlotSymbol } from './slots.types';

export const REEL_COUNT = 3;

/*
 * Tuned to a 96.00% return to player — see `theoreticalRtp` and its spec, which
 * fails if a change here moves it out of the 95–97% band. Pairs carry most of
 * the hits, so they are where the margin comes from: a low pair hands the stake
 * back, and the sevens are the one line worth chasing.
 */
export const SLOT_SYMBOLS: readonly SlotSymbol[] = [
  { symbol: '🍒', weight: 30, payout3: 4, payout2: 1 },
  { symbol: '🍋', weight: 25, payout3: 6, payout2: 1 },
  { symbol: '🔔', weight: 18, payout3: 10, payout2: 1 },
  { symbol: '⭐', weight: 14, payout3: 20, payout2: 2 },
  { symbol: '💎', weight: 9, payout3: 40, payout2: 3 },
  { symbol: '7️⃣', weight: 4, payout3: 250, payout2: 5 },
];

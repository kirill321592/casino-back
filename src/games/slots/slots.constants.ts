import { SlotSymbol } from './slots.types';

export const SLOTS_NAMESPACE = '/slots';

export const REEL_COUNT = 3;

export const SLOT_SYMBOLS: readonly SlotSymbol[] = [
  { symbol: '🍒', weight: 30, payout3: 4, payout2: 1 },
  { symbol: '🍋', weight: 25, payout3: 6, payout2: 1 },
  { symbol: '🔔', weight: 18, payout3: 10, payout2: 2 },
  { symbol: '⭐', weight: 14, payout3: 20, payout2: 3 },
  { symbol: '💎', weight: 9, payout3: 40, payout2: 5 },
  { symbol: '7️⃣', weight: 4, payout3: 100, payout2: 10 },
];

import { REEL_COUNT, SLOT_SYMBOLS } from './slots.constants';

/** Pays the best matching line: three of a kind, otherwise a pair. */
export function lineMultiplier(reels: readonly string[]): number {
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

/**
 * Return to player: the share of every stake the machine pays back on average,
 * as a fraction (0.96 = 96%).
 *
 * Worked out exactly rather than simulated — every possible line is enumerated
 * (6³ = 216 for three reels) and scored with the same `lineMultiplier` a real
 * spin uses, so the published figure cannot drift from the rules.
 */
export function theoreticalRtp(): number {
  const totalWeight = SLOT_SYMBOLS.reduce((sum, entry) => sum + entry.weight, 0);

  const visit = (reels: string[], probability: number): number => {
    if (reels.length === REEL_COUNT) return probability * lineMultiplier(reels);

    return SLOT_SYMBOLS.reduce(
      (sum, entry) =>
        sum + visit([...reels, entry.symbol], (probability * entry.weight) / totalWeight),
      0,
    );
  };

  return visit([], 1);
}

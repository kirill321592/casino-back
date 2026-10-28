import { lineMultiplier, theoreticalRtp } from './slots.math';

describe('lineMultiplier', () => {
  it('pays three of a kind', () => {
    expect(lineMultiplier(['7️⃣', '7️⃣', '7️⃣'])).toBe(250);
  });

  it('pays a pair wherever it lands', () => {
    expect(lineMultiplier(['💎', '🍒', '💎'])).toBe(3);
  });

  it('pays nothing without a match', () => {
    expect(lineMultiplier(['🍒', '🍋', '🔔'])).toBe(0);
  });
});

describe('theoreticalRtp', () => {
  /* The house edge is what keeps the lights on; a paytable edit that tips this
   * past 100% pays players to play. The band is the industry's usual one. */
  it('stays between 95% and 97%', () => {
    const rtp = theoreticalRtp();
    expect(rtp).toBeGreaterThanOrEqual(0.95);
    expect(rtp).toBeLessThanOrEqual(0.97);
  });
});

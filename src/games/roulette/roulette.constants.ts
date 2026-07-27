export const ROULETTE_NAMESPACE = '/roulette';

/** European wheel: a single zero plus 1-36. */
export const POCKET_COUNT = 37;

export const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

/** Payouts include the returned stake. */
export const STRAIGHT_MULTIPLIER = 36;
export const OUTSIDE_MULTIPLIER = 2;

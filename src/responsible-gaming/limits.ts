/*
 * The rules behind the player's own limits, kept free of Nest and of storage so
 * they can be read — and tested — in one place.
 *
 * The one rule that shapes everything else: a limit may always be tightened at
 * once, but loosening it waits out a cooling-off period. A limit that could be
 * lifted mid-session, in the heat of a losing streak, would not be a limit.
 */

export const COOLING_OFF_MS = 24 * 60 * 60 * 1000;

/** Reality-check intervals the client offers. `null` turns the reminder off. */
export const REALITY_CHECK_MINUTES = [15, 30, 60, 120] as const;
export const DEFAULT_REALITY_CHECK_MINUTES = 60;

/** Self-exclusion lengths on offer. Once started, one cannot be cut short. */
export const SELF_EXCLUSION_DAYS = [1, 7, 30, 180] as const;

export interface PlayLimits {
  /** Most the player may lose in one UTC day, net of winnings. `null` is no limit. */
  dailyLossLimit: number | null;
  /** A looser limit waiting out its cooling-off period. */
  pendingDailyLossLimit: { amount: number | null; effectiveAt: string } | null;
  /** Minutes between reality checks; `null` turns them off. */
  realityCheckMinutes: number | null;
}

export function defaultLimits(): PlayLimits {
  return {
    dailyLossLimit: null,
    pendingDailyLossLimit: null,
    realityCheckMinutes: DEFAULT_REALITY_CHECK_MINUTES,
  };
}

/** The UTC calendar day `now` falls on, as YYYY-MM-DD. Daily limits reset at its end. */
export function utcDay(now: Date): string {
  return now.toISOString().slice(0, 10);
}

/** Promotes a pending limit whose cooling-off has run out. */
export function settlePending(limits: PlayLimits, now: Date): PlayLimits {
  const pending = limits.pendingDailyLossLimit;
  if (!pending || Date.parse(pending.effectiveAt) > now.getTime()) return limits;

  return { ...limits, dailyLossLimit: pending.amount, pendingDailyLossLimit: null };
}

/**
 * Applies a request for a new daily loss limit. Tighter than the current one
 * (or a first limit) takes effect now and cancels anything pending; looser, or
 * none at all, is queued behind the cooling-off period.
 */
export function requestDailyLossLimit(
  limits: PlayLimits,
  amount: number | null,
  now: Date,
): PlayLimits {
  const current = settlePending(limits, now);
  const tighter =
    amount !== null && (current.dailyLossLimit === null || amount <= current.dailyLossLimit);

  if (tighter) return { ...current, dailyLossLimit: amount, pendingDailyLossLimit: null };
  if (amount === current.dailyLossLimit) return { ...current, pendingDailyLossLimit: null };

  return {
    ...current,
    pendingDailyLossLimit: {
      amount,
      effectiveAt: new Date(now.getTime() + COOLING_OFF_MS).toISOString(),
    },
  };
}

/** Whole dollars, the way the client shows them. */
export function formatMoney(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`;
}

/** Shown wherever a self-excluded player is turned away. */
export function selfExclusionMessage(until: string): string {
  const date = new Date(until).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  });
  return `You have taken a break from play until ${date} UTC.`;
}

import { PlayLimits } from './limits';

/** What the client's responsible-gaming page shows: the limits, and where today stands. */
export interface LimitsView extends PlayLimits {
  /** Net loss so far this UTC day, never below zero. */
  lossToday: number;
  /** How long a looser limit waits before it applies. */
  coolingOffHours: number;
}

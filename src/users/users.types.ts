import { PlayLimits } from '../responsible-gaming/limits';

export interface User {
  id: string;
  username: string;
  /** scrypt digest, never leaves the server. */
  passwordHash: string;
  balance: number;
  createdAt: string;
  /** When the player confirmed they are of age and accepted the terms, and which terms. */
  termsAcceptedAt: string;
  termsVersion: string;
  limits: PlayLimits;
  /** Stakes minus winnings for one UTC day. Negative when the player is ahead. */
  lossToday: { day: string; amount: number };
  /** ISO time before which the account may not play or sign in. */
  selfExcludedUntil: string | null;
}

/** The shape the client is allowed to see. */
export interface UserProfile {
  id: string;
  username: string;
  balance: number;
}

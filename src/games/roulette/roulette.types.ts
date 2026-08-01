export enum BetType {
  STRAIGHT = 'straight',
  RED = 'red',
  BLACK = 'black',
  EVEN = 'even',
  ODD = 'odd',
}

export type RoundStatus = 'betting' | 'spinning';

export interface Bet {
  /** The account the stake came off — a socket id would not survive a reconnect. */
  userId: string;
  type: BetType;
  amount: number;
  number?: number;
}

/** A bet that has been taken, together with what it left the player holding. */
export interface PlacedBet {
  bet: Bet;
  balance: number;
}

export interface Round {
  id: string;
  status: RoundStatus;
  closesAt: number;
}

export interface RoundState {
  id: string;
  status: RoundStatus;
  closesAt: string;
  betsCount: number;
}

/** Server-side view of a settled round: what won, and who it paid. */
export interface RoundResult {
  number: number;
  payouts: Record<string, number>;
}

/**
 * What a single player is told. Everyone learns the number; nobody learns anyone
 * else's stake or winnings.
 */
export interface PlayerRoundResult {
  number: number;
  payout: number;
  balance: number;
}

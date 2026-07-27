export enum BetType {
  STRAIGHT = 'straight',
  RED = 'red',
  BLACK = 'black',
  EVEN = 'even',
  ODD = 'odd',
}

export type RoundStatus = 'betting' | 'spinning';

export interface Bet {
  playerId: string;
  type: BetType;
  amount: number;
  number?: number;
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

export interface RoundResult {
  number: number;
  payouts: Record<string, number>;
}

export enum BetType {
  STRAIGHT = 'straight',
  RED = 'red',
  BLACK = 'black',
  EVEN = 'even',
  ODD = 'odd',
}

export interface Bet {
  playerId: string;
  type: BetType;
  amount: number;
  number?: number;
}

export interface RoundState {
  id: string;
  status: 'betting' | 'spinning';
  closesAt: string;
  betsCount: number;
}

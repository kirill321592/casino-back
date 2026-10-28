export interface SlotSymbol {
  symbol: string;
  /** Relative chance of landing on a reel. */
  weight: number;
  /** Multiplier for three of a kind. */
  payout3: number;
  /** Multiplier for a pair. */
  payout2: number;
}

/** Fetched by the client so the paytable it renders comes from the server. */
export interface SlotsPaytable {
  reelCount: number;
  /** Theoretical return to player as a fraction, e.g. 0.96 for 96%. */
  rtp: number;
  symbols: Array<Omit<SlotSymbol, 'weight'>>;
}

export interface SpinResult {
  reels: string[];
  bet: number;
  multiplier: number;
  winnings: number;
  /** The player's balance once the stake and any winnings have settled. */
  balance: number;
}

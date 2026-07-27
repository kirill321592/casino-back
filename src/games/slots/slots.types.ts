export interface SlotSymbol {
  symbol: string;
  /** Relative chance of landing on a reel. */
  weight: number;
  /** Multiplier for three of a kind. */
  payout3: number;
  /** Multiplier for a pair. */
  payout2: number;
}

/** Sent on connect so the client can render the paytable from the server. */
export interface SlotsPaytable {
  reelCount: number;
  symbols: Array<Omit<SlotSymbol, 'weight'>>;
}

export interface SpinResult {
  reels: string[];
  bet: number;
  multiplier: number;
  winnings: number;
}

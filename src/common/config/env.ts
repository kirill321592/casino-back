function num(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const env = {
  get port() {
    return num(process.env.PORT, 3000);
  },
  get corsOrigin(): string[] | true {
    return process.env.CORS_ORIGIN?.split(',') ?? true;
  },
  get roundDurationMs() {
    return num(process.env.ROUND_DURATION_MS, 15_000);
  },
  get roundBreakMs() {
    return num(process.env.ROUND_BREAK_MS, 3_000);
  },
  get maxBet() {
    return num(process.env.MAX_BET, 100_000);
  },
};

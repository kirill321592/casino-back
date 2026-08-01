import { randomBytes } from 'crypto';

function num(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Dev convenience only: without JWT_SECRET the process signs with a key that
 * dies with it, so restarting invalidates every token. Production refuses to
 * boot instead — a guessable or shared secret is a forgeable session.
 */
const ephemeralSecret = randomBytes(48).toString('hex');

export const env = {
  get isProduction() {
    return process.env.NODE_ENV === 'production';
  },
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
  get startingBalance() {
    return num(process.env.STARTING_BALANCE, 1_000);
  },
  get jwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (secret && secret.length >= 32) return secret;
    if (this.isProduction) {
      throw new Error('JWT_SECRET must be set to at least 32 characters in production');
    }
    return ephemeralSecret;
  },
  get jwtTtlSeconds() {
    return num(process.env.JWT_TTL_SECONDS, 12 * 60 * 60);
  },
  /** Cookies only travel over HTTPS in production; dev runs on plain localhost. */
  get cookieSecure() {
    return process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : this.isProduction;
  },
  /**
   * `lax` is what makes the session cookie CSRF-resistant: the browser withholds
   * it from cross-site POSTs. Only widen this to `none` when the API and the app
   * are on different sites, and only together with COOKIE_SECURE=true.
   */
  get cookieSameSite(): 'lax' | 'strict' | 'none' {
    const value = process.env.COOKIE_SAME_SITE;
    return value === 'strict' || value === 'none' ? value : 'lax';
  },
};

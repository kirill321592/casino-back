import { CookieOptions } from 'express';
import { env } from '../common/config/env';

export const AUTH_COOKIE = 'roulette_token';

/**
 * httpOnly keeps the token out of reach of any script on the page, which is what
 * makes a stolen-by-XSS session hard; SameSite is the CSRF half. Both matter more
 * than convenience here, so the client never sees the token itself.
 */
export function authCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    path: '/',
    maxAge: env.jwtTtlSeconds * 1000,
  };
}

/**
 * Reads one cookie out of a raw `Cookie` header. Doing it by hand keeps
 * cookie-parser off the dependency list, and the WebSocket handshake — which
 * never goes through Express middleware — needs exactly this anyway.
 */
export function readCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;

  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) continue;
    if (part.slice(0, separator).trim() !== name) continue;

    return decodeURIComponent(part.slice(separator + 1).trim());
  }
  return undefined;
}

/** `Authorization: Bearer <token>`, for clients that cannot hold a cookie. */
export function readBearer(header: string | undefined): string | undefined {
  const [scheme, token] = header?.split(' ') ?? [];
  return scheme === 'Bearer' && token ? token : undefined;
}

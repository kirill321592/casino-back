import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const derive = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

const SALT_BYTES = 16;
const KEY_BYTES = 64;

/** Stored as `salt:key` — the salt is per user, so equal passwords hash differently. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES).toString('hex');
  const key = await derive(password, salt, KEY_BYTES);
  return `${salt}:${key.toString('hex')}`;
}

/** Constant-time on the digest, so a wrong password leaks nothing by timing. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, keyHex] = stored.split(':');
  if (!salt || !keyHex) return false;

  const expected = Buffer.from(keyHex, 'hex');
  const actual = await derive(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

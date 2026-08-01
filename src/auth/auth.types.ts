import { Request } from 'express';
import { User, UserProfile } from '../users/users.types';

/** Claims we sign. `sub` is the user id; the rest is convenience for logging. */
export interface JwtPayload {
  sub: string;
  username: string;
}

/** What a successful sign-up or sign-in hands back, cookie aside. */
export interface AuthSession {
  token: string;
  user: UserProfile;
}

/** An HTTP request that has passed AuthGuard. */
export interface AuthedRequest extends Request {
  user: User;
}

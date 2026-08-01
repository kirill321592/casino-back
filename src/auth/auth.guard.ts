import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AUTH_COOKIE, readBearer, readCookie } from './auth.cookie';
import { AuthService } from './auth.service';
import { AuthedRequest } from './auth.types';

/**
 * Guards every route that spends or reports a balance. The cookie is the browser's
 * path; the bearer header is there for anything that cannot hold one.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const token =
      readCookie(request.headers.cookie, AUTH_COOKIE) ?? readBearer(request.headers.authorization);

    if (!token) throw new UnauthorizedException('Sign in to play');

    request.user = await this.auth.verify(token);
    return true;
  }
}

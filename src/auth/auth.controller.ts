import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { User, UserProfile } from '../users/users.types';
import { AUTH_COOKIE, authCookieOptions } from './auth.cookie';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { AuthSession } from './auth.types';
import { CurrentUser } from './current-user.decorator';
import { CredentialsDto } from './dto/credentials.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
  ) {}

  @Post('signup')
  async signUp(
    @Body() signUp: SignUpDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<UserProfile> {
    return this.start(await this.auth.signUp(signUp), response);
  }

  /* Signing in creates no resource, so 200 rather than Nest's default 201. */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() credentials: CredentialsDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<UserProfile> {
    return this.start(await this.auth.signIn(credentials), response);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  signOut(@Res({ passthrough: true }) response: Response): void {
    // Same attributes as when it was set, or the browser keeps the old cookie.
    response.clearCookie(AUTH_COOKIE, {
      ...authCookieOptions(),
      maxAge: undefined,
    });
  }

  /** Restores a session on reload, and doubles as the balance the client starts from. */
  @Get('me')
  @UseGuards(AuthGuard)
  me(@CurrentUser() user: User): UserProfile {
    return this.users.toProfile(user);
  }

  /* The token rides in the cookie; the body carries only what is safe to read. */
  private start({ token, user }: AuthSession, response: Response): UserProfile {
    response.cookie(AUTH_COOKIE, token, authCookieOptions());
    return user;
  }
}

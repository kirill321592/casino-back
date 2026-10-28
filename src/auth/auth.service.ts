import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { selfExclusionMessage } from '../responsible-gaming/limits';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.types';
import { AuthSession, JwtPayload } from './auth.types';
import { CredentialsDto } from './dto/credentials.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { hashPassword, verifyPassword } from './password';
import { TERMS_VERSION } from './terms';

/**
 * A password hash of a value nobody can sign in with. Comparing against it when
 * the username is unknown keeps sign-in's cost — and so its timing — the same
 * whether or not the account exists, which is what stops user enumeration.
 */
const DECOY_HASH = `${'0'.repeat(32)}:${'0'.repeat(128)}`;

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  /* The DTO has already insisted on both confirmations; recording them is creating the account. */
  async signUp({ username, password }: SignUpDto): Promise<AuthSession> {
    const user = this.users.create(username, await hashPassword(password), TERMS_VERSION);
    return this.issue(user);
  }

  async signIn({ username, password }: CredentialsDto): Promise<AuthSession> {
    const user = this.users.findByUsername(username);
    const matches = await verifyPassword(password, user?.passwordHash ?? DECOY_HASH);

    // One message for both failures: which half was wrong is not the caller's business.
    if (!user || !matches) throw new UnauthorizedException('Incorrect username or password');
    // Only after the password checks out, so the message cannot confirm an account exists.
    if (this.users.isSelfExcluded(user)) {
      throw new ForbiddenException(selfExclusionMessage(user.selfExcludedUntil!));
    }
    return this.issue(user);
  }

  /**
   * Turns a token back into the account it names. A signature can outlive the
   * record it points at — the store is in memory, so a restart empties it — hence
   * the lookup rather than trusting the claims alone.
   */
  async verify(token: string): Promise<User> {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Your session has expired. Please sign in again.');
    }

    const user = this.users.findById(payload.sub);
    if (!user) throw new UnauthorizedException('Your session is no longer valid. Please sign in.');
    // A session from before the break ends with it; the client treats this like any expiry.
    if (this.users.isSelfExcluded(user)) {
      throw new UnauthorizedException(selfExclusionMessage(user.selfExcludedUntil!));
    }
    return user;
  }

  private async issue(user: User): Promise<AuthSession> {
    const payload: JwtPayload = { sub: user.id, username: user.username };
    return {
      token: await this.jwt.signAsync(payload),
      user: this.users.toProfile(user),
    };
  }
}

import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

/**
 * Same credential rules for sign-up and sign-in, so a caller cannot probe one
 * endpoint with a username or password the other would reject. The username
 * charset is deliberately narrow: it is displayed back to other players.
 */
export class CredentialsDto {
  @IsString()
  @MinLength(3)
  @MaxLength(24)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Username may only contain letters, numbers, underscores and hyphens',
  })
  username!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}

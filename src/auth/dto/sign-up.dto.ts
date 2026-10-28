import { Equals } from 'class-validator';
import { CredentialsDto } from './credentials.dto';

/**
 * Opening an account is where the player confirms their age and agrees to the
 * terms. Both are recorded against the account, so they are required here
 * rather than trusted to a checkbox the client could skip.
 */
export class SignUpDto extends CredentialsDto {
  @Equals(true, { message: 'You must be 18 or older to play' })
  confirmsAdult!: boolean;

  @Equals(true, { message: 'You must accept the Terms of Use to play' })
  acceptsTerms!: boolean;
}

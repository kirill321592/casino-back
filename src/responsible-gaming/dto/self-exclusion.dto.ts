import { IsIn } from 'class-validator';
import { SELF_EXCLUSION_DAYS } from '../limits';

export class SelfExclusionDto {
  @IsIn(SELF_EXCLUSION_DAYS, {
    message: `days must be one of ${SELF_EXCLUSION_DAYS.join(', ')}`,
  })
  days!: number;
}

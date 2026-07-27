import { IsInt, Max, Min } from 'class-validator';
import { env } from '../../../common/config/env';

export class SpinSlotsDto {
  @IsInt()
  @Min(1)
  @Max(env.maxBet)
  bet!: number;
}

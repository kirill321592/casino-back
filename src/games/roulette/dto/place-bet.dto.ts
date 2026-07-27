import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { env } from '../../../common/config/env';
import { POCKET_COUNT } from '../roulette.constants';
import { BetType } from '../roulette.types';

export class PlaceBetDto {
  @IsString()
  roundId!: string;

  @IsEnum(BetType)
  type!: BetType;

  @IsInt()
  @Min(1)
  @Max(env.maxBet)
  amount!: number;

  // Required for straight bets; ignored for colour bets.
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(POCKET_COUNT - 1)
  number?: number;
}

import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { BetType } from '../types/roulette.types';

export class PlaceBetDto {
  @IsString()
  roundId!: string;

  @IsEnum(BetType)
  type!: BetType;

  @IsInt()
  @Min(1)
  @Max(100000)
  amount!: number;

  // Required for straight bets; ignored for colour bets.
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(36)
  number?: number;
}

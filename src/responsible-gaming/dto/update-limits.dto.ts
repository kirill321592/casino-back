import { IsIn, IsInt, Max, Min, ValidateIf } from 'class-validator';
import { REALITY_CHECK_MINUTES } from '../limits';

/* High enough to never be the reason a limit is refused, low enough to be a number. */
const MAX_DAILY_LOSS_LIMIT = 1_000_000;

/**
 * Both fields are required: `null` switches a limit off, a value sets it. The
 * service decides when each change takes effect — see `requestDailyLossLimit`.
 */
export class UpdateLimitsDto {
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(1)
  @Max(MAX_DAILY_LOSS_LIMIT)
  dailyLossLimit!: number | null;

  @ValidateIf((_, value) => value !== null)
  @IsIn(REALITY_CHECK_MINUTES, {
    message: `realityCheckMinutes must be one of ${REALITY_CHECK_MINUTES.join(', ')}, or null`,
  })
  realityCheckMinutes!: number | null;
}

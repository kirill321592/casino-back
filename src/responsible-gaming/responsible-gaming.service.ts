import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.types';
import { UpdateLimitsDto } from './dto/update-limits.dto';
import { COOLING_OFF_MS, requestDailyLossLimit } from './limits';
import { LimitsView } from './responsible-gaming.types';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The player-facing side of the limits. Enforcement is not here: it sits in
 * `UsersService.debit`, the one door every stake goes through.
 */
@Injectable()
export class ResponsibleGamingService {
  constructor(private readonly users: UsersService) {}

  getLimits(user: User): LimitsView {
    return {
      ...this.users.getLimits(user.id),
      lossToday: this.users.getLossToday(user.id),
      coolingOffHours: COOLING_OFF_MS / (60 * 60 * 1000),
    };
  }

  /* A reminder restricts nothing, so it changes at once in either direction. */
  updateLimits(user: User, { dailyLossLimit, realityCheckMinutes }: UpdateLimitsDto): LimitsView {
    const now = new Date();
    const limits = requestDailyLossLimit(this.users.getLimits(user.id, now), dailyLossLimit, now);
    this.users.setLimits(user.id, { ...limits, realityCheckMinutes });
    return this.getLimits(user);
  }

  selfExclude(user: User, days: number): void {
    this.users.selfExclude(user.id, new Date(Date.now() + days * DAY_MS));
  }
}

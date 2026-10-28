import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AUTH_COOKIE, authCookieOptions } from '../auth/auth.cookie';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/users.types';
import { SelfExclusionDto } from './dto/self-exclusion.dto';
import { UpdateLimitsDto } from './dto/update-limits.dto';
import { ResponsibleGamingService } from './responsible-gaming.service';
import { LimitsView } from './responsible-gaming.types';

@Controller('account')
@UseGuards(AuthGuard)
export class ResponsibleGamingController {
  constructor(private readonly responsibleGaming: ResponsibleGamingService) {}

  @Get('limits')
  limits(@CurrentUser() user: User): LimitsView {
    return this.responsibleGaming.getLimits(user);
  }

  @Put('limits')
  updateLimits(@CurrentUser() user: User, @Body() limits: UpdateLimitsDto): LimitsView {
    return this.responsibleGaming.updateLimits(user, limits);
  }

  /*
   * Ends the session along with starting the break: the cookie is cleared here,
   * and any other session is refused by `AuthService.verify` from now on.
   */
  @Post('self-exclusion')
  @HttpCode(HttpStatus.NO_CONTENT)
  selfExclude(
    @CurrentUser() user: User,
    @Body() { days }: SelfExclusionDto,
    @Res({ passthrough: true }) response: Response,
  ): void {
    this.responsibleGaming.selfExclude(user, days);
    response.clearCookie(AUTH_COOKIE, { ...authCookieOptions(), maxAge: undefined });
  }
}

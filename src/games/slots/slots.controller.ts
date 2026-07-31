import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SpinSlotsDto } from './dto/spin-slots.dto';
import { SlotsService } from './slots.service';
import { SlotsPaytable, SpinResult } from './slots.types';

/**
 * Slots is request/response — one spin, one answer, no shared state — so it
 * needs no socket. Roulette keeps its gateway because its rounds are timed
 * and shared, which only the server can announce.
 */
@Controller('slots')
export class SlotsController {
  constructor(private readonly slots: SlotsService) {}

  @Get('paytable')
  paytable(): SlotsPaytable {
    return this.slots.getPaytable();
  }

  /* A spin creates nothing, so it answers 200 rather than Nest's default 201. */
  @Post('spin')
  @HttpCode(HttpStatus.OK)
  spin(@Body() { bet }: SpinSlotsDto): SpinResult {
    return this.slots.spin(bet);
  }
}

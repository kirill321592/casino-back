import { Module } from '@nestjs/common';
import { RouletteModule } from './roulette/roulette.module';
import { SlotsModule } from './slots/slots.module';

/** Register a new game by adding its module here. */
@Module({
  imports: [RouletteModule, SlotsModule],
})
export class GamesModule {}

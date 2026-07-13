import { Module } from '@nestjs/common';
import { RouletteGateway } from './roulette.gateway';
import { RouletteService } from './roulette.service';

@Module({
  providers: [RouletteGateway, RouletteService],
})
export class RouletteModule {}

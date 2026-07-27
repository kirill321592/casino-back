import { Module } from '@nestjs/common';
import { RngModule } from '../../common/rng/rng.module';
import { RouletteGateway } from './roulette.gateway';
import { RouletteService } from './roulette.service';

@Module({
  imports: [RngModule],
  providers: [RouletteGateway, RouletteService],
})
export class RouletteModule {}

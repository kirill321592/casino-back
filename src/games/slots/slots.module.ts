import { Module } from '@nestjs/common';
import { RngModule } from '../../common/rng/rng.module';
import { SlotsGateway } from './slots.gateway';
import { SlotsService } from './slots.service';

@Module({
  imports: [RngModule],
  providers: [SlotsGateway, SlotsService],
})
export class SlotsModule {}

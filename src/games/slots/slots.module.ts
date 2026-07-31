import { Module } from '@nestjs/common';
import { RngModule } from '../../common/rng/rng.module';
import { SlotsController } from './slots.controller';
import { SlotsService } from './slots.service';

@Module({
  imports: [RngModule],
  controllers: [SlotsController],
  providers: [SlotsService],
})
export class SlotsModule {}

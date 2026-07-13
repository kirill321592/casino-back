import { Module } from '@nestjs/common';
import { RouletteModule } from './roulette/roulette.module';

@Module({
  imports: [RouletteModule],
})
export class AppModule {}

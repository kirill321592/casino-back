import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { RngModule } from '../../common/rng/rng.module';
import { UsersModule } from '../../users/users.module';
import { RouletteGateway } from './roulette.gateway';
import { RouletteService } from './roulette.service';

@Module({
  imports: [RngModule, AuthModule, UsersModule],
  providers: [RouletteGateway, RouletteService],
})
export class RouletteModule {}

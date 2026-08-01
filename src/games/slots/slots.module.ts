import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { RngModule } from '../../common/rng/rng.module';
import { UsersModule } from '../../users/users.module';
import { SlotsController } from './slots.controller';
import { SlotsService } from './slots.service';

@Module({
  imports: [RngModule, AuthModule, UsersModule],
  controllers: [SlotsController],
  providers: [SlotsService],
})
export class SlotsModule {}

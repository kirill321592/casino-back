import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ResponsibleGamingController } from './responsible-gaming.controller';
import { ResponsibleGamingService } from './responsible-gaming.service';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [ResponsibleGamingController],
  providers: [ResponsibleGamingService],
})
export class ResponsibleGamingModule {}

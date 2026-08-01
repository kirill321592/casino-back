import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { GamesModule } from './games/games.module';

@Module({
  imports: [AuthModule, GamesModule],
})
export class AppModule {}

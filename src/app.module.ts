import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { GamesModule } from './games/games.module';
import { ResponsibleGamingModule } from './responsible-gaming/responsible-gaming.module';

@Module({
  imports: [AuthModule, GamesModule, ResponsibleGamingModule],
})
export class AppModule {}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from './common/config/env';
import { validationPipe } from './common/validation';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: env.corsOrigin, credentials: true });
  app.useGlobalPipes(validationPipe);

  await app.listen(env.port);
}

void bootstrap();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';
import { uploadsRoot } from './common/uploads-path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  const uploadsDir = uploadsRoot();
  mkdirSync(join(uploadsDir, 'photos'), { recursive: true });
  app.useStaticAssets(uploadsDir, { prefix: '/uploads' });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
  });

  const port = config.get<number>('PORT', 3001);
  await app.listen(port);
  console.log(`API running on http://localhost:${port}/api`);
}

bootstrap();

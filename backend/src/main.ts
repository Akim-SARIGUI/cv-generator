import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';
import { validationException } from './common/coded-exception';
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
      exceptionFactory: validationException,
    }),
  );

  app.enableCors({
    origin: resolveCorsOrigin(config),
    credentials: true,
  });

  const port = config.get<number>('PORT', 3001);
  await app.listen(port);
  console.log(`API running on http://localhost:${port}/api`);
}

bootstrap();

/** Origines autorisées : CORS_ORIGIN (liste) et, par défaut, les fronts https://*.netlify.app. */
function resolveCorsOrigin(config: ConfigService) {
  const allowed = (config.get<string>('CORS_ORIGIN', 'http://localhost:3000') ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowNetlify = config.get<string>('CORS_ALLOW_NETLIFY', 'true') !== 'false';

  return (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowed.includes('*') || allowed.includes(origin)) {
      callback(null, true);
      return;
    }
    if (allowNetlify && /^https:\/\/[a-z0-9-]+\.netlify\.app$/i.test(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origine CORS refusée'), false);
  };
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { json, urlencoded } from 'express';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

import * as fs from 'fs';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, { bodyParser: false });

    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));

    // Security Hardening
    const httpAdapter = app.getHttpAdapter().getInstance();
    httpAdapter.set('trust proxy', 1);
    app.use(helmet());

    // `origin: '*'` together with `credentials: true` is rejected by browsers —
    // the pair is invalid, so the permissive setting was not even doing what it
    // looked like it was doing. Use an explicit allowlist instead.
    const allowedOrigins = new Set<string>();
    for (const origin of (process.env.CORS_ORIGINS || '').split(',')) {
      const trimmed = origin.trim();
      if (trimmed) allowedOrigins.add(trimmed);
    }
    for (const origin of [
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.FRONTEND_URL,
    ]) {
      if (origin) allowedOrigins.add(origin.trim());
    }
    if (allowedOrigins.size === 0) {
      allowedOrigins.add('http://localhost:3000');
    }

    app.enableCors({
      origin: Array.from(allowedOrigins),
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX || '1000', 10),
        message: 'Too many requests from this IP, please try again later.',
      }),
    );

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    // Turn Prisma failures into meaningful 4xx responses instead of the bare
    // 500 "Internal server error" the UI used to show for every one of them.
    app.useGlobalFilters(new PrismaExceptionFilter());

    const port = process.env.PORT || 3001;
    await app.listen(port);
  } catch (err) {
    // Also surface the failure on stderr and exit non-zero — writing only to
    // crash.log meant a failed boot looked like a silent, healthy exit to PM2.
    const detail = String(err) + (err?.stack ? '\n' + err.stack : '');
    console.error('Failed to bootstrap application:', detail);
    try {
      fs.writeFileSync('crash.log', detail);
    } catch {
      // Best effort only — never mask the original error.
    }
    process.exit(1);
  }
}
bootstrap();

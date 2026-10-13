import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

/** node-postgres defaults to 10; override per deployment with DB_POOL_MAX. */
const DEFAULT_POOL_MAX = 15;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private static readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;

  constructor() {
    const connectionString =
      process.env.DATABASE_URL ||
      'postgresql://postgres:password@localhost:5436/qmanager?schema=public';

    const poolMax = Number.parseInt(process.env.DB_POOL_MAX || '', 10);

    const pool = new Pool({
      connectionString,
      max:
        Number.isInteger(poolMax) && poolMax > 0 ? poolMax : DEFAULT_POOL_MAX,
      // Without this, a request that cannot get a connection — pool exhausted,
      // or Postgres unreachable — waits forever instead of failing.
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 30_000,
    });

    // An error on an idle client is emitted on the pool, and an unhandled
    // 'error' event takes the whole process down. Log and let the pool discard
    // the client instead.
    pool.on('error', (err) => {
      PrismaService.logger.error(`Idle database client error: ${err.message}`);
    });

    super({ adapter: new PrismaPg(pool) });
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end().catch(() => undefined);
  }
}

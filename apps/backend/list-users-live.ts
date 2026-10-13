import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';

function getDbUrl() {
  // An explicitly exported DATABASE_URL wins, which is how the Prisma CLI
  // behaves: prisma.config.ts loads dotenv, and dotenv does not override a
  // variable that is already set. Reading .env first meant that exporting a
  // database on the command line was silently ignored here while prisma
  // honoured it, so a migration and a script could target different databases.
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
      if (match && match[1]) return match[1];
    }
  } catch (e) {}
  return process.env.DATABASE_URL || 'postgresql://qmanager_user:password@localhost:5432/qmanager_v2';
}

const connectionString = getDbUrl();
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, name: true }
  });
  console.log('--- USERS IN LIVE DATABASE ---');
  for (const u of users) {
    console.log(`- ${u.name} (${u.email})`);
  }
}

main().finally(() => prisma.$disconnect());

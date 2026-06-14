import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';

function getDbUrl() {
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

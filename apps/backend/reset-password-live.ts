import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
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
      if (match && match[1]) {
        console.log('Using DATABASE_URL from .env');
        return match[1];
      }
    }
  } catch (e) {
    console.error('Failed to read .env file', e);
  }
  console.log('Falling back to default DATABASE_URL');
  return process.env.DATABASE_URL || 'postgresql://qmanager_user:password@localhost:5432/qmanager_v2';
}

const connectionString = getDbUrl();
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const superAdminRole = await prisma.role.findUnique({ where: { name: 'Super Admin' } });

  if (!superAdminRole) {
    console.log('Super Admin role does not exist in the database! Please run permission seeder first.');
    return;
  }

  const allUsers = await prisma.user.findMany();
  
  if (allUsers.length === 0) {
    console.log('NO USERS FOUND IN THE LIVE DATABASE!');
    return;
  }

  console.log(`Found ${allUsers.length} users. Granting Super Admin to all of them...`);

  for (const user of allUsers) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        roles: {
          upsert: {
            where: {
              userId_roleId: {
                userId: user.id,
                roleId: superAdminRole.id
              }
            },
            update: {},
            create: { roleId: superAdminRole.id }
          }
        }
      }
    });
    console.log(`Granted Super Admin to: ${user.email}`);
  }

  console.log('All existing users have been granted Super Admin access in the LIVE DB.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

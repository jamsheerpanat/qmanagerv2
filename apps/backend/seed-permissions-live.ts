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
  console.log('--- SEEDING PERMISSIONS & ROLES IN LIVE DB ---');

  const termsPermissions = [
    { action: 'terms.view', description: 'View Terms and Conditions' },
    { action: 'terms.create', description: 'Create Terms and Conditions' },
    { action: 'terms.update', description: 'Update Terms and Conditions' },
    { action: 'terms.delete', description: 'Delete Terms and Conditions' },
  ];

  // 1. Create Permissions
  for (const perm of termsPermissions) {
    await prisma.permission.upsert({
      where: { action: perm.action },
      update: {},
      create: perm,
    });
  }
  console.log('Terms permissions seeded successfully.');

  // 2. Create Super Admin Role
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: {},
    create: {
      name: 'Super Admin',
      description: 'System Administrator with full access',
    },
  });
  console.log('Super Admin role ensured.');

  // 3. Attach all permissions to Super Admin role
  const allPerms = await prisma.permission.findMany();
  for (const p of allPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: p.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: p.id,
      },
    });
  }
  console.log('All permissions attached to Super Admin role.');

  // 4. Grant Super Admin to all existing users
  const allUsers = await prisma.user.findMany();
  if (allUsers.length === 0) {
    console.log('No users found in live database to grant Super Admin to!');
  } else {
    for (const user of allUsers) {
      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId: superAdminRole.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          roleId: superAdminRole.id,
        },
      });
      console.log(`Granted Super Admin to: ${user.email}`);
    }
  }

  console.log('--- DONE! YOU CAN NOW REFRESH YOUR BROWSER ---');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5436/qmanager?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Assigning terms permissions to Super Admin...');

  const superAdminRole = await prisma.role.findUnique({ where: { name: 'Super Admin' } });
  if (!superAdminRole) {
    console.log('Super Admin role not found.');
    process.exit(1);
  }

  const newPermissions = [
    { action: 'terms.view', description: 'View Terms & Conditions' },
    { action: 'terms.create', description: 'Create Terms & Conditions' },
    { action: 'terms.update', description: 'Update Terms & Conditions' },
    { action: 'terms.delete', description: 'Delete Terms & Conditions' },
  ];

  for (const perm of newPermissions) {
    const createdPerm = await prisma.permission.upsert({
      where: { action: perm.action },
      update: {},
      create: perm,
    });

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: createdPerm.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: createdPerm.id,
      },
    });
  }

  console.log('Permissions assigned successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

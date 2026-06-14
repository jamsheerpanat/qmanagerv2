import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5436/qmanager?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'jamsheer@octonics.com';
  const newPassword = 'Finn@9975#';
  const passwordHash = await bcrypt.hash(newPassword, 10);

  let user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const superAdminRole = await prisma.role.findUnique({ where: { name: 'Super Admin' } });

    await prisma.user.update({
      where: { email },
      data: { 
        passwordHash,
        roles: superAdminRole ? {
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
        } : undefined
      },
    });
    console.log(`Password for ${email} has been updated and Super Admin role ensured.`);
  } else {
    // Find default company
    const defaultCompany = await prisma.company.findFirst();
    if (!defaultCompany) {
      console.log('No company found in database to attach user to.');
      process.exit(1);
    }
    
    // Find Super Admin role
    const superAdminRole = await prisma.role.findUnique({ where: { name: 'Super Admin' } });

    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: 'Jamsheer',
        companyId: defaultCompany.id,
        roles: superAdminRole ? {
          create: [{ roleId: superAdminRole.id }]
        } : undefined
      }
    });
    console.log(`User ${email} created as Super Admin with new password.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

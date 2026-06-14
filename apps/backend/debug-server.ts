import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// We do NOT use dotenv here, we just use the default because that's what worked for seeding!
const connectionString = 'postgresql://postgres:password@localhost:5436/qmanager?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- DIAGNOSTIC REPORT ---');

  // 1. Check data counts
  const catCount = await prisma.termsCategory.count();
  const tmplCount = await prisma.termsTemplate.count();
  const groupCount = await prisma.termsGroup.count();
  console.log(`Terms Data: ${catCount} categories, ${tmplCount} templates, ${groupCount} groups.`);

  // 2. Check roles
  const roles = await prisma.role.findMany();
  console.log(`Roles in system: ${roles.map(r => r.name).join(', ') || 'NONE'}`);

  // 3. Check jamsheer@octonics.com
  const user = await prisma.user.findUnique({
    where: { email: 'jamsheer@octonics.com' },
    include: {
      roles: {
        include: {
          role: true
        }
      }
    }
  });

  if (!user) {
    console.log('User jamsheer@octonics.com NOT FOUND!');
  } else {
    console.log(`User jamsheer@octonics.com FOUND.`);
    console.log(`User Roles: ${user.roles.map(ur => ur.role.name).join(', ') || 'NO ROLES ASSIGNED'}`);
  }

  console.log('--- END OF REPORT ---');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

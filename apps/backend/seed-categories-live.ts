import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

function getDbUrl() {
  if (process.env.LIVE_DATABASE_URL) {
    console.log('Using LIVE_DATABASE_URL from environment variable');
    return process.env.LIVE_DATABASE_URL;
  }
  
  console.warn('\n⚠️ WARNING: LIVE_DATABASE_URL is not set.');
  console.warn('To seed the live database remotely, run:');
  console.warn('LIVE_DATABASE_URL="your_live_db_url_here" npx tsx seed-categories-live.ts\n');
  
  if (process.env.FORCE_LOCAL_SEED === 'true') {
    if (process.env.DATABASE_URL) {
      console.log('Using local DATABASE_URL because FORCE_LOCAL_SEED=true');
      return process.env.DATABASE_URL;
    }
  }
  
  console.error('Aborting. Use FORCE_LOCAL_SEED=true to seed local db.');
  process.exit(1);
}

const connectionString = getDbUrl();
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding extra categories...');

  // Software Development Categories
  const swDevST = await prisma.serviceType.findFirst({
    where: { slug: 'software-development' },
  });

  if (swDevST) {
    const newCategories = [
      'Hardware Devices',
      'POS Equipment',
      'Printers & Scanners',
      'Web Applications',
      'Mobile Applications',
      'UI/UX Design',
      'Cloud Subscriptions',
      'Support & Maintenance',
      'Third-Party APIs',
      'Annual Maintenance Contracts'
    ];

    for (const cat of newCategories) {
      const existing = await prisma.productCategory.findFirst({
        where: { name: cat, serviceTypeId: swDevST.id }
      });
      if (!existing) {
        await prisma.productCategory.create({
          data: {
            name: cat,
            serviceTypeId: swDevST.id,
            isActive: true
          }
        });
        console.log(`Added: ${cat}`);
      }
    }
  }

  // IT Infrastructure Categories
  const itInfraST = await prisma.serviceType.findFirst({
    where: { slug: 'it-infrastructure' },
  });

  if (itInfraST) {
    const itCategories = [
      'Servers & Storage',
      'Networking Cables',
      'Routers & Firewalls',
      'Racks & Cabinets',
      'Software Licenses',
      'Access Points & WiFi'
    ];

    for (const cat of itCategories) {
      const existing = await prisma.productCategory.findFirst({
        where: { name: cat, serviceTypeId: itInfraST.id }
      });
      if (!existing) {
        await prisma.productCategory.create({
          data: {
            name: cat,
            serviceTypeId: itInfraST.id,
            isActive: true
          }
        });
        console.log(`Added: ${cat}`);
      }
    }
  }

  // Smart Home Categories
  const smartHomeST = await prisma.serviceType.findFirst({
    where: { slug: 'smart-home-automation' },
  });

  if (smartHomeST) {
    const smartHomeCats = [
      'Sensors & Detectors',
      'Smart Lighting',
      'Smart Thermostats',
      'Controllers & Hubs',
      'Security Cameras'
    ];
    for (const cat of smartHomeCats) {
      const existing = await prisma.productCategory.findFirst({
        where: { name: cat, serviceTypeId: smartHomeST.id }
      });
      if (!existing) {
        await prisma.productCategory.create({
          data: {
            name: cat,
            serviceTypeId: smartHomeST.id,
            isActive: true
          }
        });
        console.log(`Added: ${cat}`);
      }
    }
  }

  // CCTV & Access Control
  const cctvST = await prisma.serviceType.findFirst({
    where: { slug: 'cctv-access-control' },
  });

  if (cctvST) {
    const cctvCats = [
      'CCTV Cameras',
      'NVR & Storage',
      'Access Control Panels',
      'Biometric Readers',
      'Cables & Accessories'
    ];
    for (const cat of cctvCats) {
      const existing = await prisma.productCategory.findFirst({
        where: { name: cat, serviceTypeId: cctvST.id }
      });
      if (!existing) {
        await prisma.productCategory.create({
          data: {
            name: cat,
            serviceTypeId: cctvST.id,
            isActive: true
          }
        });
        console.log(`Added: ${cat}`);
      }
    }
  }

  console.log('Categories seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

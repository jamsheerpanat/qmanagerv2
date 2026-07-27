import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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
    ];

    for (const cat of newCategories) {
      await prisma.productCategory.upsert({
        where: {
          name_serviceTypeId: {
            name: cat,
            serviceTypeId: swDevST.id
          }
        },
        update: {},
        create: {
          name: cat,
          serviceTypeId: swDevST.id,
          isActive: true
        }
      });
    }
    console.log('Added Software Development categories.');
  }

  const itInfraST = await prisma.serviceType.findFirst({
    where: { slug: 'it-infrastructure' },
  });

  if (itInfraST) {
    const itCategories = [
      'Servers & Storage',
      'Networking Cables',
      'Routers & Firewalls',
      'Racks & Cabinets',
      'Software Licenses'
    ];

    for (const cat of itCategories) {
      await prisma.productCategory.upsert({
        where: {
          name_serviceTypeId: {
            name: cat,
            serviceTypeId: itInfraST.id
          }
        },
        update: {},
        create: {
          name: cat,
          serviceTypeId: itInfraST.id,
          isActive: true
        }
      });
    }
    console.log('Added IT Infrastructure categories.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

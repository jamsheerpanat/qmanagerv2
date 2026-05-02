import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const invoice = await prisma.invoice.findFirst({
    include: { company: true, customer: true, items: true }
  });
  console.log(invoice ? invoice.company : 'NO INVOICE');
}
main().finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const invoice = await prisma.invoice.findFirst({
    include: { company: true, customer: true, items: true }
  });
  console.log(JSON.stringify(invoice, null, 2));
}
main().finally(() => prisma.$disconnect());

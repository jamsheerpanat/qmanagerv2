import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `postgresql://qmanager_user:qmanager_pass_2024@localhost:5432/qmanager_v2?schema=public`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting data fix...');

  // 1. Delete Sample Customers
  const sampleCustomerNames = [
    'Acme Corporation',
    'Global Logistics LLC',
    'Skyline Real Estate',
    'TechNova Solutions',
    'Retail Giants',
  ];

  const customersToDelete = await prisma.customer.findMany({
    where: { displayName: { in: sampleCustomerNames } },
  });

  for (const customer of customersToDelete) {
    console.log(`Deleting customer: ${customer.displayName}`);
    // Delete FollowUps associated with Leads
    const leads = await prisma.lead.findMany({ where: { customerId: customer.id } });
    for (const lead of leads) {
      await prisma.followUp.deleteMany({ where: { leadId: lead.id } });
    }
    // Delete Leads
    await prisma.lead.deleteMany({ where: { customerId: customer.id } });

    // Delete Quotations (and cascaded items/scopes/terms)
    await prisma.quotation.deleteMany({ where: { customerId: customer.id } });

    // Delete Invoices
    await prisma.invoice.deleteMany({ where: { customerId: customer.id } }).catch(() => {});

    // Delete Customer
    await prisma.customer.delete({ where: { id: customer.id } });
    console.log(`Successfully deleted customer: ${customer.displayName}`);
  }

  // 2. Add Maximum T&C
  // Fetch service types
  const smartHomeST = await prisma.serviceType.findFirst({ where: { slug: 'smart-home-automation' } });
  const swDevST = await prisma.serviceType.findFirst({ where: { slug: 'software-development' } });
  const itInfraST = await prisma.serviceType.findFirst({ where: { slug: 'it-infrastructure' } });
  const cctvST = await prisma.serviceType.findFirst({ where: { slug: 'cctv-access-control' } });

  // Fetch / Create General Category for each
  const getCategory = async (name: string) => {
    return await prisma.termsCategory.upsert({
      where: { name },
      update: {},
      create: { name, isActive: true },
    });
  };

  const categories = {
    general: await getCategory('General Terms'),
    payment: await getCategory('Payment Terms'),
    warranty: await getCategory('Warranty Terms'),
    support: await getCategory('Support Terms'),
    exclusions: await getCategory('Exclusions'),
    installation: await getCategory('Installation Terms'),
    software: await getCategory('Software Development Terms'),
  };

  const termsToAdd: any[] = [];

  // Smart Home
  if (smartHomeST) {
    termsToAdd.push({
      title: 'Smart Home - Installation & Site Readiness',
      content: 'The client must ensure the site is ready for installation, including required civil works and power provisions. Any delays due to site unreadiness may incur additional charges.',
      categoryId: categories.installation.id,
      serviceTypeId: smartHomeST.id,
    });
    termsToAdd.push({
      title: 'Smart Home - Warranty & Replacements',
      content: 'All smart home devices come with a standard 1-year manufacturer warranty. Replacement of defective parts will be processed within 5-7 business days subject to availability.',
      categoryId: categories.warranty.id,
      serviceTypeId: smartHomeST.id,
    });
    termsToAdd.push({
      title: 'Smart Home - Exclusions',
      content: 'Any civil works, core cutting, painting, or decorative works required during the installation process are excluded from this proposal unless explicitly mentioned.',
      categoryId: categories.exclusions.id,
      serviceTypeId: smartHomeST.id,
    });
  }

  // Software Dev
  if (swDevST) {
    termsToAdd.push({
      title: 'Software - Intellectual Property Rights',
      content: 'Upon full and final payment, the client will hold the intellectual property rights for the custom developed software. Third-party libraries remain under their respective licenses.',
      categoryId: categories.software.id,
      serviceTypeId: swDevST.id,
    });
    termsToAdd.push({
      title: 'Software - Maintenance and Support',
      content: 'A complimentary 3-month support period is provided post-deployment for bug fixes. Any new feature requests or major design changes will be billed separately.',
      categoryId: categories.support.id,
      serviceTypeId: swDevST.id,
    });
    termsToAdd.push({
      title: 'Software - Deployment & Hosting',
      content: 'Hosting infrastructure, domain names, and SSL certificates are the responsibility of the client unless explicitly included in the scope of work.',
      categoryId: categories.general.id,
      serviceTypeId: swDevST.id,
    });
  }

  // IT Infra
  if (itInfraST) {
    termsToAdd.push({
      title: 'IT Infra - Hardware Delivery',
      content: 'Delivery of hardware components is subject to global supply chain availability. Estimated delivery times are indicative and may vary. We are not liable for manufacturer delays.',
      categoryId: categories.general.id,
      serviceTypeId: itInfraST.id,
    });
    termsToAdd.push({
      title: 'IT Infra - Configuration and Handover',
      content: 'System configuration will be done as per the agreed specifications. Any post-handover configuration changes requested by the client will be considered a new task.',
      categoryId: categories.installation.id,
      serviceTypeId: itInfraST.id,
    });
    termsToAdd.push({
      title: 'IT Infra - Warranty Terms',
      content: 'Network switches, routers, and servers are covered under the respective OEM warranties. Support visits during the warranty period are strictly limited to hardware failure diagnostics.',
      categoryId: categories.warranty.id,
      serviceTypeId: itInfraST.id,
    });
  }

  // CCTV
  if (cctvST) {
    termsToAdd.push({
      title: 'CCTV - Legal & Privacy Compliance',
      content: 'The client is solely responsible for ensuring that camera placements comply with local privacy laws and regulations. We hold no liability for improper surveillance practices.',
      categoryId: categories.general.id,
      serviceTypeId: cctvST.id,
    });
    termsToAdd.push({
      title: 'CCTV - Storage Limitations',
      content: 'The quoted storage capacity (NVR/HDD) provides an estimated retention period based on standard recording settings (H.265, 15fps, Motion). Actual retention may vary.',
      categoryId: categories.general.id,
      serviceTypeId: cctvST.id,
    });
    termsToAdd.push({
      title: 'CCTV - Post-Installation Support',
      content: 'Any realignment of cameras, lens focus adjustments, or changes to NVR settings requested after the official handover will be subject to a service callout fee.',
      categoryId: categories.support.id,
      serviceTypeId: cctvST.id,
    });
  }

  // General for all
  termsToAdd.push({
      title: 'Payment Milestones',
      content: 'Payment shall be made strictly as per the agreed milestones. In the event of payment delays exceeding 15 days, project works may be suspended without notice.',
      categoryId: categories.payment.id,
      serviceTypeId: null,
  });

  for (const term of termsToAdd) {
    const slugId = `auto-tc-${term.title.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}-${Date.now().toString().slice(-4)}`;
    await prisma.termsTemplate.upsert({
      where: { id: slugId }, // slugId is unique
      update: {
        title: term.title,
        content: term.content,
        categoryId: term.categoryId,
        serviceTypeId: term.serviceTypeId,
      },
      create: {
        id: slugId,
        title: term.title,
        content: term.content,
        categoryId: term.categoryId,
        serviceTypeId: term.serviceTypeId,
      },
    });
  }
  console.log(`Added ${termsToAdd.length} terms and conditions successfully.`);

  console.log('Data fix completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

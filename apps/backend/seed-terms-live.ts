import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';

function getDbUrl() {
  if (process.env.LIVE_DATABASE_URL) {
    console.log('Using LIVE_DATABASE_URL from environment variable');
    return process.env.LIVE_DATABASE_URL;
  }
  
  // NOTE: We don't automatically read .env here because local .env usually points to localhost
  // which causes accidental seeding of local db instead of live.
  console.warn('\n⚠️ WARNING: LIVE_DATABASE_URL is not set.');
  console.warn('To seed the live database remotely, run:');
  console.warn('LIVE_DATABASE_URL="your_live_db_url_here" npx ts-node seed-terms-live.ts\n');
  
  // Fallback to local DB *only* if explicitly forced
  if (process.env.FORCE_LOCAL_SEED === 'true') {
    return process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5436/qmanager?schema=public';
  }
  
  console.error("Exiting to prevent accidental local seeding.");
  process.exit(1);
}

const connectionString = getDbUrl();
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Comprehensive Terms & Conditions Master into REAL Database...');

  // 1. Create Comprehensive Categories
  const categories = [
    { name: 'Payment Terms', description: 'Terms related to invoicing and payments' },
    { name: 'Delivery & Logistics', description: 'Timelines and logistics for hardware and software' },
    { name: 'Installation & Commissioning', description: 'Terms related to setup and configuration' },
    { name: 'Warranty & Support', description: 'Guarantees and post-sales support' },
    { name: 'Validity', description: 'Quotation validity period' },
    { name: 'Exclusions', description: 'Items explicitly not covered in the scope' },
    { name: 'Intellectual Property', description: 'Code ownership and licensing rights' },
    { name: 'Confidentiality', description: 'NDAs and data privacy terms' },
    { name: 'Customer Responsibilities', description: 'Prerequisites required from the client' },
    { name: 'Change Requests', description: 'Handling out-of-scope requests' },
    { name: 'Termination & Cancellation', description: 'Terms for canceling the contract' },
    { name: 'Limitation of Liability', description: 'Liability caps and legal disclaimers' },
    { name: 'Taxes & Duties', description: 'VAT, customs, and applicable taxes' },
    { name: 'AMC & Maintenance', description: 'Terms specific to Annual Maintenance Contracts' },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    const created = await prisma.termsCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    categoryMap.set(cat.name, created.id);
  }

  // 2. Create Comprehensive Groups
  const groups = [
    { name: 'Standard IT Infrastructure Project', description: 'Standard terms for IT infrastructure and networking' },
    { name: 'Software Development Project', description: 'Standard terms for custom software and web apps' },
    { name: 'Annual Maintenance Contract', description: 'Terms for AMC and SLA agreements' },
    { name: 'Home Automation Project', description: 'Smart home, KNX, lighting, and AV systems' },
    { name: 'Building Automation Project', description: 'BMS, access control, and CCTV for commercial buildings' },
    { name: 'Cloud & DevOps Services', description: 'Hosting, domain, AWS/Azure setup and maintenance' },
  ];

  const groupMap = new Map<string, string>();
  for (const grp of groups) {
    const created = await prisma.termsGroup.upsert({
      where: { name: grp.name },
      update: {},
      create: grp,
    });
    groupMap.set(grp.name, created.id);
  }

  // Helper function to cleanly generate template objects
  const t = (title: string, cat: string, content: string, isDef: boolean, grps: string[]) => ({
    title,
    categoryId: categoryMap.get(cat)!,
    content,
    isDefault: isDef,
    groups: grps,
  });

  // 3. Create Extensive Templates
  const templates = [
    // --- PAYMENT TERMS ---
    t('50/40/10 Hardware Payment', 'Payment Terms', '50% advance along with Purchase Order.\n40% upon delivery of hardware to site.\n10% upon successful installation and handover.', true, ['Standard IT Infrastructure Project', 'Building Automation Project', 'Home Automation Project']),
    t('50/40/10 Software Payment', 'Payment Terms', '50% advance upon project confirmation.\n40% upon completion of development and UAT.\n10% upon final deployment and handover.', true, ['Software Development Project']),
    t('100% Advance Payment', 'Payment Terms', '100% advance payment required along with the Purchase Order to initiate the delivery/service.', true, ['Annual Maintenance Contract', 'Cloud & DevOps Services']),
    t('Monthly Subscription (SaaS/Hosting)', 'Payment Terms', 'Payments to be made on a monthly basis, strictly within 7 days of the invoice date. Service suspension may occur if delayed beyond 15 days.', false, ['Software Development Project', 'Cloud & DevOps Services']),
    t('Milestone-Based Payment', 'Payment Terms', '25% Advance.\n25% Upon UI/UX Approval.\n25% Upon Beta Release.\n25% Upon Final Deployment.', false, ['Software Development Project']),
    t('Late Payment Penalty', 'Payment Terms', 'Any payment delayed beyond 30 days of the invoice date will be subject to a late payment penalty of 1.5% per month.', false, ['Standard IT Infrastructure Project', 'Building Automation Project', 'Software Development Project']),

    // --- DELIVERY & LOGISTICS ---
    t('Standard Hardware Delivery', 'Delivery & Logistics', 'Delivery within 4-6 weeks from the date of advance payment and PO confirmation. Subject to stock availability at the manufacturer.', true, ['Standard IT Infrastructure Project', 'Home Automation Project', 'Building Automation Project']),
    t('Software Development Timeline', 'Delivery & Logistics', 'Estimated 12–16 weeks from project kickoff and advance payment receipt. Timeline is strictly subject to timely client feedback and approval phases.', true, ['Software Development Project']),
    t('Partial Deliveries', 'Delivery & Logistics', 'Partial deliveries are allowed and will be invoiced proportionately. The client agrees to accept and pay for partial deliveries as they arrive.', false, ['Standard IT Infrastructure Project', 'Building Automation Project']),

    // --- INSTALLATION & COMMISSIONING ---
    t('Standard Installation Scope', 'Installation & Commissioning', 'Installation includes mounting, physical connectivity, basic configuration, and testing as per the approved design. Any structural modifications are out of scope.', true, ['Standard IT Infrastructure Project', 'Home Automation Project']),
    t('BMS Commissioning', 'Installation & Commissioning', 'Commissioning includes point-to-point testing, integration of third-party systems via open protocols, and graphic interface setup as per the approved IO list.', true, ['Building Automation Project']),
    t('Working Hours', 'Installation & Commissioning', 'All installation works will be carried out during standard working hours (8:00 AM to 5:00 PM, Sun-Thu). After-hours work requires prior approval and may incur extra charges.', false, ['Standard IT Infrastructure Project', 'Building Automation Project', 'Home Automation Project']),

    // --- WARRANTY & SUPPORT ---
    t('1 Year Manufacturer Warranty', 'Warranty & Support', 'All hardware comes with a standard 1-year manufacturer warranty against manufacturing defects. Physical damage, electrical surges, and acts of nature are not covered.', true, ['Standard IT Infrastructure Project', 'Building Automation Project', 'Home Automation Project']),
    t('Software Warranty & Bug Fixes', 'Warranty & Support', 'Includes 3 months of free support and bug fixing post-deployment. A bug is defined as the system failing to perform a feature documented in the approved scope.', true, ['Software Development Project']),
    t('No Warranty on Software Modifications', 'Warranty & Support', 'Warranty becomes null and void if the client or a third party makes unauthorized modifications to the source code, database, or server configurations.', false, ['Software Development Project']),
    
    // --- EXCLUSIONS ---
    t('Civil & Electrical Exclusions', 'Exclusions', 'Any civil work, core cutting, scaffolding, conduits, pulling cables, or heavy electrical modifications are excluded from our scope unless explicitly mentioned.', true, ['Standard IT Infrastructure Project', 'Building Automation Project', 'Home Automation Project']),
    t('Third-Party Software Licensing', 'Exclusions', 'Cost of third-party licenses (e.g., Windows Server, SQL Server, specialized API subscriptions) are not included unless explicitly itemized in the quotation.', true, ['Software Development Project', 'Cloud & DevOps Services']),
    t('Data Entry Exclusions', 'Exclusions', 'Data entry, content creation, and manual data migration from legacy systems are excluded from this scope unless explicitly itemized.', true, ['Software Development Project']),

    // --- CUSTOMER RESPONSIBILITIES ---
    t('Site Readiness', 'Customer Responsibilities', 'The client must ensure the site is ready (power, AC, networking, dust-free environment) before our team arrives for installation.', true, ['Standard IT Infrastructure Project', 'Building Automation Project', 'Home Automation Project']),
    t('Timely Feedback', 'Customer Responsibilities', 'The client must provide feedback on UI designs, software modules, and test results within 3 working days. Delays in feedback will directly push back the project timeline.', true, ['Software Development Project']),
    t('Provision of Access', 'Customer Responsibilities', 'Client must provide necessary access (VPN, physical access, server credentials) without delay to avoid project bottlenecks.', true, ['Software Development Project', 'Cloud & DevOps Services', 'Annual Maintenance Contract']),

    // --- INTELLECTUAL PROPERTY ---
    t('Source Code Ownership', 'Intellectual Property', 'Upon full and final payment, the client will receive full ownership and rights to the bespoke source code developed. However, any core framework or libraries used remain the property of the developer.', true, ['Software Development Project']),
    t('Right to use for Portfolio', 'Intellectual Property', 'The vendor reserves the right to use the client’s name, logo, and a general description of the project in its marketing portfolio, unless a strict NDA is signed.', false, ['Software Development Project', 'Standard IT Infrastructure Project']),

    // --- CHANGE REQUESTS ---
    t('Out of Scope Changes', 'Change Requests', 'Any requirement not explicitly mentioned in the approved Scope of Work document will be treated as a Change Request (CR) and will be billed separately at standard hourly rates.', true, ['Software Development Project']),
    t('Hardware Variations', 'Change Requests', 'Any changes in hardware quantities or specifications after PO issuance will be subject to a revised quotation and may affect delivery timelines.', true, ['Standard IT Infrastructure Project', 'Home Automation Project', 'Building Automation Project']),

    // --- TERMINATION & CANCELLATION ---
    t('Cancellation Policy', 'Termination & Cancellation', 'If the project is cancelled after PO issuance, the advance payment will not be refunded. The client is liable for all work completed and hardware procured up to the date of cancellation.', true, ['Standard IT Infrastructure Project', 'Software Development Project']),
    t('AMC Termination', 'Termination & Cancellation', 'Either party may terminate the Annual Maintenance Contract by providing a 30-day written notice. No refunds will be provided for the unexpired portion of the AMC.', true, ['Annual Maintenance Contract']),

    // --- LIMITATION OF LIABILITY ---
    t('Liability Cap', 'Limitation of Liability', 'Under no circumstances shall the vendor’s total liability exceed the total amount paid by the client for the specific hardware or service causing the claim.', true, ['Standard IT Infrastructure Project', 'Software Development Project', 'Building Automation Project']),
    t('No Liability for Data Loss', 'Limitation of Liability', 'The vendor is not responsible for any loss of data. The client is solely responsible for maintaining adequate backups of their systems before any installation or maintenance activity.', true, ['Standard IT Infrastructure Project', 'Software Development Project', 'Annual Maintenance Contract', 'Cloud & DevOps Services']),

    // --- TAXES & DUTIES ---
    t('Exclusive of Taxes', 'Taxes & Duties', 'All prices quoted are exclusive of VAT, sales tax, customs duties, or any other government levies. Any such taxes applicable at the time of invoicing will be borne by the client.', true, ['Standard IT Infrastructure Project', 'Software Development Project', 'Annual Maintenance Contract']),

    // --- VALIDITY ---
    t('30 Days Validity', 'Validity', 'This proposal and the prices quoted are valid for a period of 30 days from the date of issue. Prices are subject to change after this period due to currency fluctuations or component pricing.', true, ['Standard IT Infrastructure Project', 'Software Development Project', 'Building Automation Project', 'Home Automation Project', 'Annual Maintenance Contract', 'Cloud & DevOps Services']),

    // --- AMC & MAINTENANCE ---
    t('SLA & Response Time', 'AMC & Maintenance', 'Under this AMC, critical issues will be responded to within 4 hours, and non-critical issues within 24 hours (during standard business hours).', true, ['Annual Maintenance Contract']),
    t('Preventive Maintenance', 'AMC & Maintenance', 'Includes 4 scheduled preventive maintenance visits per year. A detailed report will be submitted after each visit.', true, ['Annual Maintenance Contract']),
    t('Spare Parts Exclusion', 'AMC & Maintenance', 'This AMC covers service and labor only. The cost of any faulty spare parts, batteries, or consumables that need replacement will be billed separately to the client.', true, ['Annual Maintenance Contract']),
  ];

  let addedCount = 0;
  for (const t of templates) {
    const existing = await prisma.termsTemplate.findFirst({
      where: { title: t.title, categoryId: t.categoryId },
    });

    const connectGroups = t.groups.map(g => ({ id: groupMap.get(g)! }));

    if (existing) {
      await prisma.termsTemplate.update({
        where: { id: existing.id },
        data: {
          content: t.content,
          isDefault: t.isDefault,
          groups: {
            connect: connectGroups
          }
        },
      });
      addedCount++;
    } else {
      await prisma.termsTemplate.create({
        data: {
          title: t.title,
          content: t.content,
          categoryId: t.categoryId,
          isDefault: t.isDefault,
          groups: {
            connect: connectGroups
          }
        },
      });
      addedCount++;
    }
  }

  console.log(`Terms & Conditions Master seeded successfully into REAL DB! Added/Updated ${addedCount} templates.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

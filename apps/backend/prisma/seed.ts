import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // 1. Create Default Company
  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'Default Company',
        email: 'admin@company.com',
      },
    });
  }

  // 2. Create Default Branch
  const branch = await prisma.branch.upsert({
    where: { code: 'MAIN-001' },
    update: {},
    create: {
      companyId: company.id, // Assuming company was found/created
      name: 'Main Branch',
      code: 'MAIN-001',
    },
  });

  // 3. Create Default Permissions
  const permissionsList = [
    'customers.view',
    'customers.create',
    'customers.update',
    'customers.delete',
    'leads.view',
    'leads.create',
    'leads.update',
    'leads.delete',
    'products.view',
    'products.create',
    'products.update',
    'products.delete',
    'terms.view',
    'terms.create',
    'terms.update',
    'terms.delete',
    'quotations.view',
    'quotations.create',
    'quotations.update',
    'quotations.approve',
    'quotations.generate_pdf',
    'quotations.send',
    'quotations.revise',
    'quotations.convert_to_invoice',
    'invoices.view',
    'invoices.create',
    'invoices.update',
    'invoices.record_payment',
    'invoices.generate_pdf',
    'reports.view',
    'settings.manage',
    'users.manage',
    'audit.view',
  ];

  const permissionsMap = new Map<string, string>();
  for (const action of permissionsList) {
    const perm = await prisma.permission.upsert({
      where: { action },
      update: {},
      create: { action, description: `Allow ${action}` },
    });
    permissionsMap.set(action, perm.id);
  }

  // 4. Create Roles
  const roles = [
    'Super Admin',
    'Admin',
    'Manager',
    'Sales Executive',
    'Accountant',
    'Document Controller',
    'Viewer',
    'Customer Portal User',
  ];

  const rolesMap = new Map<string, string>();
  for (const name of roles) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name, description: `System default role: ${name}` },
    });
    rolesMap.set(name, role.id);
  }

  // 5. Assign all permissions to Super Admin
  const superAdminRoleId = rolesMap.get('Super Admin')!;
  for (const [action, permId] of permissionsMap.entries()) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRoleId,
          permissionId: permId,
        },
      },
      update: {},
      create: {
        roleId: superAdminRoleId,
        permissionId: permId,
      },
    });
  }

  // 6. Create Super Admin User
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const adminEmail = 'superadmin@qmanager.local';

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      companyId: company.id,
      branchId: branch.id,
      name: 'Super Admin',
      email: adminEmail,
      passwordHash,
      status: 'ACTIVE',
    },
  });

  // Assign role to Super Admin
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: superAdminRoleId,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: superAdminRoleId,
    },
  });

  // 7. Seed Quotation Templates
  const templateNames = [
    'Smart Home Automation Proposal',
    'Software Development Proposal',
    'IT Infrastructure Proposal',
    'CCTV & Access Control Proposal',
    'AMC / Maintenance Proposal',
    'General Trading Quotation',
  ];

  const templatesMap = new Map<string, string>();
  for (const name of templateNames) {
    const tmpl = await prisma.quotationTemplate.upsert({
      where: { name },
      update: {},
      create: {
        name,
        description: `Standard template for ${name}`,
        coverPageStyle: 'MODERN',
        sectionOrder: [
          'COVER',
          'INTRODUCTION',
          'SCOPE',
          'COMMERCIAL',
          'TERMS',
          'ACCEPTANCE',
        ],
      },
    });
    templatesMap.set(name, tmpl.id);
  }

  // 8. Seed Service Types
  const serviceTypes = [
    {
      name: 'Smart Home Automation',
      slug: 'smart-home-automation',
      defaultQuotationTemplateId: templatesMap.get(
        'Smart Home Automation Proposal',
      ),
    },
    {
      name: 'Software Development',
      slug: 'software-development',
      defaultQuotationTemplateId: templatesMap.get(
        'Software Development Proposal',
      ),
    },
    {
      name: 'IT Infrastructure',
      slug: 'it-infrastructure',
      defaultQuotationTemplateId: templatesMap.get(
        'IT Infrastructure Proposal',
      ),
    },
    {
      name: 'CCTV & Access Control',
      slug: 'cctv-access-control',
      defaultQuotationTemplateId: templatesMap.get(
        'CCTV & Access Control Proposal',
      ),
    },
    {
      name: 'AMC / Maintenance',
      slug: 'amc-maintenance',
      defaultQuotationTemplateId: templatesMap.get(
        'AMC / Maintenance Proposal',
      ),
    },
    {
      name: 'General Trading',
      slug: 'general-trading',
      defaultQuotationTemplateId: templatesMap.get('General Trading Quotation'),
    },
  ];

  for (const st of serviceTypes) {
    await prisma.serviceType.upsert({
      where: { slug: st.slug },
      update: {},
      create: {
        name: st.name,
        slug: st.slug,
        defaultQuotationTemplateId: st.defaultQuotationTemplateId,
        isActive: true,
      },
    });
  }

  // 9. Seed Terms Categories
  const termsCategories = [
    'General Terms',
    'Payment Terms',
    'Delivery Terms',
    'Installation Terms',
    'Software Development Terms',
    'Smart Home Automation Terms',
    'AMC Terms',
    'Warranty Terms',
    'Support Terms',
    'Exclusions',
    'Validity Terms',
    'Cancellation Terms',
    'Project Timeline Terms',
  ];

  for (const tc of termsCategories) {
    await prisma.termsCategory.upsert({
      where: { name: tc },
      update: {},
      create: { name: tc, isActive: true },
    });
  }

  // 10. Seed Customers
  const customersList = [
    {
      name: 'Acme Corporation',
      email: 'contact@acmecorp.com',
      industryType: 'Technology',
    },
    {
      name: 'Global Logistics LLC',
      email: 'procurement@globallog.com',
      industryType: 'Logistics',
    },
    {
      name: 'Skyline Real Estate',
      email: 'info@skylinere.com',
      industryType: 'Real Estate',
    },
    {
      name: 'TechNova Solutions',
      email: 'sales@technova.com',
      industryType: 'IT Services',
    },
    {
      name: 'Retail Giants',
      email: 'vendor-management@retailgiants.com',
      industryType: 'Retail',
    },
  ];

  const customersMap = new Map<string, any>();
  for (let i = 0; i < customersList.length; i++) {
    const c = customersList[i];
    const customerCode = `CUST-00${i + 1}`;
    const cust = await prisma.customer.upsert({
      where: { customerCode },
      update: {},
      create: {
        companyId: company.id,
        branchId: branch.id,
        customerType: 'COMPANY',
        displayName: c.name,
        email: c.email,
        phone: `+1 555-010${i}`,
        industryType: c.industryType,
        customerCode,
      },
    });
    customersMap.set(c.name, cust);
  }

  // 11. Seed Product Categories
  const smartHomeST = await prisma.serviceType.findFirst({
    where: { slug: 'smart-home-automation' },
  });
  const swDevST = await prisma.serviceType.findFirst({
    where: { slug: 'software-development' },
  });
  const itInfraST = await prisma.serviceType.findFirst({
    where: { slug: 'it-infrastructure' },
  });
  const cctvST = await prisma.serviceType.findFirst({
    where: { slug: 'cctv-access-control' },
  });

  const productCats = [
    { name: 'Smart Home Devices', stId: smartHomeST?.id },
    { name: 'Network Switches', stId: itInfraST?.id },
    { name: 'CCTV Cameras', stId: cctvST?.id },
    { name: 'Software Licenses', stId: swDevST?.id },
    { name: 'Consulting Hours', stId: swDevST?.id },
  ];

  const pCatsMap = new Map<string, any>();
  for (const pc of productCats) {
    if (!pc.stId) continue;
    let cat = await prisma.productCategory.findFirst({
      where: { name: pc.name, serviceTypeId: pc.stId },
    });
    if (!cat) {
      cat = await prisma.productCategory.create({
        data: { name: pc.name, serviceTypeId: pc.stId, isActive: true },
      });
    }
    pCatsMap.set(pc.name, cat);
  }

  // 12. Seed Products
  const productsList = [
    {
      name: 'Smart Relay 4-Channel',
      code: 'SR-04',
      cat: 'Smart Home Devices',
      price: 150,
      cost: 90,
    },
    {
      name: 'KNX Touch Panel',
      code: 'KNX-TP10',
      cat: 'Smart Home Devices',
      price: 450,
      cost: 300,
    },
    {
      name: '24-Port PoE Switch',
      code: 'NET-24P',
      cat: 'Network Switches',
      price: 299,
      cost: 150,
    },
    {
      name: '4K Dome Camera',
      code: 'CAM-4K',
      cat: 'CCTV Cameras',
      price: 120,
      cost: 65,
    },
    {
      name: 'Enterprise ERP License',
      code: 'SW-ERP',
      cat: 'Software Licenses',
      price: 5000,
      cost: 0,
    },
    {
      name: 'Senior Developer (Hourly)',
      code: 'SRV-DEV',
      cat: 'Consulting Hours',
      price: 150,
      cost: 50,
    },
  ];

  for (const p of productsList) {
    const cat = pCatsMap.get(p.cat);
    if (!cat) continue;

    await prisma.product.upsert({
      where: { productCode: p.code },
      update: {},
      create: {
        categoryId: cat.id,
        serviceTypeId: cat.serviceTypeId,
        productName: p.name,
        productCode: p.code,
        sellingPrice: p.price,
        costPrice: p.cost,
        isActive: true,
      },
    });
  }

  // 13. Seed Leads
  const acme = customersMap.get('Acme Corporation');
  const skyline = customersMap.get('Skyline Real Estate');

  if (acme && skyline) {
    await prisma.lead.upsert({
      where: { enquiryNumber: 'ENQ-001' },
      update: {},
      create: {
        companyId: company.id,
        customerId: acme.id,
        enquiryNumber: 'ENQ-001',
        projectTitle: 'HQ Smart Automation Retrofit',
        expectedBudget: 15000,
        status: 'NEW',
        source: 'WEBSITE',
        enquiryDate: new Date(),
      },
    });

    await prisma.lead.upsert({
      where: { enquiryNumber: 'ENQ-002' },
      update: {},
      create: {
        companyId: company.id,
        customerId: skyline.id,
        enquiryNumber: 'ENQ-002',
        projectTitle: 'Downtown Tower CCTV Installation',
        expectedBudget: 8500,
        status: 'QUOTATION_IN_PROGRESS',
        source: 'PHONE_CALL',
        enquiryDate: new Date(),
      },
    });
  } // closing if block properly

  // 14. Seed Terms and Conditions Samples
  const tcCategory = await prisma.termsCategory.upsert({
    where: { name: 'Standard Hardware Terms' },
    update: {},
    create: {
      name: 'Standard Hardware Terms',
      isActive: true,
    },
  });

  const sampleTerms = [
    {
      title: '1. Scope of Work',
      content:
        'The Contractor shall provide all necessary labor, materials, tools, and equipment to complete the Integration as described in this proposal.',
    },
    {
      title: '2. Payment Terms',
      content:
        'A 50% advance payment is required upon acceptance. 40% upon delivery of equipment. 10% upon successful testing and commissioning.',
    },
    {
      title: '3. Warranty',
      content:
        'All hardware is covered by a 2-year manufacturer warranty. The Contractor provides a 1-year workmanship warranty from the date of commissioning.',
    },
    {
      title: '4. Intellectual Property',
      content:
        'All programming files, source code, and configurations remain the property of the Contractor until full payment is received.',
    },
    {
      title: '5. Limitation of Liability',
      content:
        'The Contractor shall not be liable for any indirect, incidental, special, or consequential damages arising out of the performance of this agreement.',
    },
  ];

  for (const term of sampleTerms) {
    const slugId = `seed-tc-${term.title.substring(0, 4).replace(/[^a-zA-Z0-9]/g, '')}`;
    await prisma.termsTemplate.upsert({
      where: { id: slugId },
      update: {},
      create: {
        id: slugId,
        title: term.title,
        content: term.content,
        categoryId: tcCategory.id,
      },
    });
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

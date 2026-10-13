import { Prisma } from '@prisma/client';

/**
 * Company fields that are safe to send to a client.
 *
 * The Company row also holds SMTP credentials (`smtpPass` is stored in plain
 * text, since nodemailer needs it verbatim). Including the whole row published
 * those credentials — on the quotation portal, to anyone holding a share link.
 * Every response that carries a company must select through this.
 */
export const PUBLIC_COMPANY_SELECT = {
  id: true,
  name: true,
  legalName: true,
  logoUrl: true,
  taxNumber: true,
  address: true,
  phone: true,
  email: true,
  defaultCurrency: true,
  defaultQuotationValidityDays: true,
  quotationPrefix: true,
  invoicePrefix: true,
  authorizedSignatureUrl: true,
  companyStampUrl: true,
  footerText: true,
  brandColor: true,
} satisfies Prisma.CompanySelect;

/**
 * Identifying fields for a user referenced from another record (an approver,
 * a creator). The full row carries `passwordHash` and the hashed
 * `refreshToken`, neither of which belongs in an API response.
 */
export const USER_SUMMARY_SELECT = {
  id: true,
  name: true,
  email: true,
} satisfies Prisma.UserSelect;

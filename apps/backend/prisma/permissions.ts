/**
 * Canonical list of permission actions understood by the API.
 *
 * Every string used in a `@RequirePermissions(...)` decorator MUST appear here,
 * otherwise the endpoint becomes unreachable for every non-Super-Admin role
 * (the permission row simply never exists to be granted).
 *
 * Imported by both `prisma/seed.ts` and `seed-permissions-live.ts` so the two
 * can never drift apart.
 */
export const PERMISSION_ACTIONS = [
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
  // Without view_all, a user only sees the quotations they created themselves.
  'quotations.view_all',
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
  'invoices.delete',
  'invoices.record_payment',
  'invoices.generate_pdf',

  'documents.view',
  'reports.view',
  'settings.manage',
  'users.manage',
  'audit.view',
] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

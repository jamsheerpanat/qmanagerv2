/**
 * Finds quotations that carry a total but hold no line items.
 *
 * Cause: `replaceItems` used to delete every item before inserting the new set,
 * outside a transaction. When the insert was rejected the delete still stood, so
 * the quotation was left with zero items while its totals — recalculated by the
 * preceding PATCH, before the delete — kept showing the old amount. The save
 * path is now transactional, so no new rows can end up in this state; this
 * script reports the ones damaged before that fix.
 *
 * Usage:
 *   npx ts-node check-empty-quotations.ts          # report only
 *   npx ts-node check-empty-quotations.ts --fix    # also zero the stale totals
 *
 * The line items themselves are not recoverable — they have to be re-entered.
 * `--fix` only clears the misleading totals so an affected quotation reads as
 * empty instead of appearing to be worth something.
 */
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';

function getDbUrl() {
  // An explicitly exported DATABASE_URL wins, which is how the Prisma CLI
  // behaves: prisma.config.ts loads dotenv, and dotenv does not override a
  // variable that is already set. Reading .env first meant that exporting a
  // database on the command line was silently ignored here while prisma
  // honoured it, so a migration and a script could target different databases.
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
      if (match && match[1]) return match[1];
    }
  } catch {
    // Fall through to the environment.
  }
  return (
    process.env.DATABASE_URL ||
    'postgresql://qmanager_user:password@localhost:5432/qmanager_v2'
  );
}

const dbUrl = getDbUrl();
const pool = new Pool({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

/** Host and database only — never the credentials. */
function describeDbUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname}:${u.port || '5432'}${u.pathname}`;
  } catch {
    return '(unparseable DATABASE_URL)';
  }
}

async function main() {
  const shouldFix = process.argv.includes('--fix');

  console.log(`Database: ${describeDbUrl(dbUrl)}\n`);

  const affected = await prisma.quotation.findMany({
    where: {
      items: { none: {} },
      OR: [{ grandTotal: { not: 0 } }, { subtotal: { not: 0 } }],
    },
    select: {
      id: true,
      quotationNumber: true,
      revisionNumber: true,
      status: true,
      grandTotal: true,
      currency: true,
      updatedAt: true,
      customer: { select: { displayName: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  if (affected.length === 0) {
    console.log('No quotations with totals but no items. Nothing to do.');
    return;
  }

  console.log(
    `Found ${affected.length} quotation(s) with a total but no line items:\n`,
  );
  for (const q of affected) {
    console.log(
      `  ${q.quotationNumber} rev${q.revisionNumber}  ${q.currency} ${q.grandTotal}  ` +
        `${q.status}  ${q.customer?.displayName ?? 'unknown customer'}  ` +
        `(last saved ${q.updatedAt.toISOString().slice(0, 10)})`,
    );
  }
  console.log('\nThe line items are gone and must be re-entered by hand.');

  if (!shouldFix) {
    console.log('Re-run with --fix to zero the stale totals on these rows.');
    return;
  }

  const result = await prisma.quotation.updateMany({
    where: { id: { in: affected.map((q) => q.id) } },
    data: {
      subtotal: 0,
      discountAmount: 0,
      taxAmount: 0,
      grandTotal: 0,
      totalCost: 0,
      grossMargin: 0,
    },
  });
  console.log(`\nCleared stale totals on ${result.count} quotation(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

/**
 * Generates `productThumbnail` for products that only have a full-size
 * `productImage`.
 *
 * List endpoints stopped returning `productImage` and render `productThumbnail`
 * instead, so until this has run, products created before the change show the
 * "No img" placeholder in the catalogue and the item picker. Their full images
 * are untouched — the detail page and generated PDFs still show them.
 *
 * Safe to re-run: rows that already have a thumbnail are skipped.
 *
 * Usage:
 *   npx ts-node backfill-product-thumbnails.ts            # report only
 *   npx ts-node backfill-product-thumbnails.ts --write    # generate and save
 *
 * sharp is a devDependency, so run this from a development checkout pointed at
 * the target database rather than on the server.
 */
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

/** Must match THUMBNAIL_WIDTH in the frontend's lib/image.ts. */
const THUMBNAIL_WIDTH = 160;

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

/** Decodes a data URL, downscales it, and re-encodes it as a JPEG data URL. */
async function makeThumbnail(dataUrl: string): Promise<string | null> {
  const comma = dataUrl.indexOf(',');
  if (!dataUrl.startsWith('data:image') || comma < 0) return null;

  const buffer = Buffer.from(dataUrl.slice(comma + 1), 'base64');
  const resized = await sharp(buffer)
    .resize({ width: THUMBNAIL_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: 60 })
    .toBuffer();

  return `data:image/jpeg;base64,${resized.toString('base64')}`;
}

const kb = (s: string) => (s.length / 1024).toFixed(1) + 'KB';

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
  const write = process.argv.includes('--write');

  console.log(`Database: ${describeDbUrl(dbUrl)}\n`);

  const products = await prisma.product.findMany({
    where: { productImage: { not: null }, productThumbnail: null },
    select: { id: true, productCode: true, productName: true, productImage: true },
  });

  if (products.length === 0) {
    console.log('Every product with an image already has a thumbnail.');
    return;
  }

  console.log(
    `${products.length} product(s) need a thumbnail${write ? '' : ' (dry run — pass --write to save)'}:\n`,
  );

  let done = 0;
  let skipped = 0;
  let before = 0;
  let after = 0;

  for (const product of products) {
    const full = product.productImage!;
    let thumbnail: string | null = null;
    try {
      thumbnail = await makeThumbnail(full);
    } catch (err) {
      console.log(`  ${product.productCode}: FAILED (${String(err)})`);
      skipped++;
      continue;
    }

    if (!thumbnail) {
      console.log(`  ${product.productCode}: skipped (not a data URL)`);
      skipped++;
      continue;
    }

    before += full.length;
    after += thumbnail.length;
    console.log(
      `  ${product.productCode} — ${product.productName}: ${kb(full)} -> ${kb(thumbnail)}`,
    );

    if (write) {
      await prisma.product.update({
        where: { id: product.id },
        data: { productThumbnail: thumbnail },
      });
    }
    done++;
  }

  console.log(
    `\n${done} thumbnail(s) ${write ? 'saved' : 'generated'}` +
      (skipped ? `, ${skipped} skipped` : ''),
  );
  if (done > 0) {
    console.log(
      `Catalogue list payload for these rows: ${kb(String(before))} -> ${kb(String(after))} ` +
        `(${(100 - (after / before) * 100).toFixed(0)}% smaller)`,
    );
  }
  if (!write) console.log('Nothing was written. Re-run with --write to save.');
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

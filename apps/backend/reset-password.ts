/**
 * Resets the Super Admin accounts to fresh random passwords.
 *
 *   npx ts-node reset-password.ts [email ...]
 *
 * With no arguments it resets DEFAULT_ACCOUNTS. Each password is generated at
 * run time and printed once, to this terminal only. It is never written to a
 * file, because this repository is public: the passwords this script used to
 * hardcode were readable by anyone.
 *
 * For each account it also:
 *  - ensures the Super Admin role and ACTIVE status (and creates the user if it
 *    is missing),
 *  - clears the stored refresh token, so sessions opened with the old password
 *    end when their 15-minute access token expires.
 *
 * DATABASE_URL is read from apps/backend/.env, like the other ops scripts, so on
 * the server it targets the same database the running API uses.
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';

const DEFAULT_ACCOUNTS = ['jamsheer@octonics.com', 'superadmin@qmanager.local'];

function getDbUrl(): string {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const match = fs
      .readFileSync(envPath, 'utf8')
      .match(/^DATABASE_URL="?([^"\n]+)"?/m);
    if (match?.[1]) return match[1];
  }
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  throw new Error(
    'DATABASE_URL not found in apps/backend/.env or the environment',
  );
}

/** 20 characters from an unambiguous alphabet, plus one of each class login rules may ask for. */
function generatePassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = randomBytes(20);
  let out = '';
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `${out}#7`;
}

const connectionString = getDbUrl();
const prisma = new PrismaClient({
  adapter: new PrismaPg(new Pool({ connectionString })),
});

async function main() {
  const emails = process.argv.slice(2).length
    ? process.argv.slice(2)
    : DEFAULT_ACCOUNTS;

  // Print host/db (never credentials) so the operator can confirm the target.
  const url = new URL(connectionString);
  console.log(`Database: ${url.hostname}:${url.port}${url.pathname}\n`);

  const superAdminRole = await prisma.role.findUnique({
    where: { name: 'Super Admin' },
  });
  if (!superAdminRole) {
    throw new Error(
      'Super Admin role does not exist. Run the permission seeder first.',
    );
  }

  const results: { email: string; password: string; action: string }[] = [];

  for (const email of emails) {
    const password = generatePassword();
    const passwordHash = await bcrypt.hash(password, 10);
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      await prisma.user.update({
        where: { email },
        data: {
          passwordHash,
          refreshToken: null,
          status: 'ACTIVE',
          roles: {
            upsert: {
              where: {
                userId_roleId: {
                  userId: existing.id,
                  roleId: superAdminRole.id,
                },
              },
              update: {},
              create: { roleId: superAdminRole.id },
            },
          },
        },
      });
      results.push({ email, password, action: 'reset' });
    } else {
      const company = await prisma.company.findFirst();
      if (!company) throw new Error(`No company to attach ${email} to.`);
      await prisma.user.create({
        data: {
          email,
          passwordHash,
          name: 'Super Admin',
          status: 'ACTIVE',
          companyId: company.id,
          roles: { create: [{ roleId: superAdminRole.id }] },
        },
      });
      results.push({ email, password, action: 'created' });
    }
  }

  console.log(
    'New Super Admin credentials — store them in a password manager now;',
  );
  console.log('they are not saved anywhere and cannot be shown again.\n');
  for (const r of results) {
    console.log(`  ${r.email}  (${r.action})`);
    console.log(`    password: ${r.password}\n`);
  }
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

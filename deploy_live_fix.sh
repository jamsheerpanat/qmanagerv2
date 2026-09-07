#!/bin/bash
#
# Production deploy for qmanager2.octolabs.cloud.
#
# `set -e` matters: without it a failed build was followed by `pm2 restart`
# anyway, so the API came back on the previous dist and the deploy still
# printed "Successfully deployed!". A broken step must stop the deploy.
set -euo pipefail

cd /var/www/qmanager-v2
git pull origin main

# apps/backend/.env is the single source of truth for the database.
#
# This used to export a hardcoded DATABASE_URL. That value won for
# `prisma db push`, because prisma.config.ts loads dotenv and dotenv never
# overrides an already-set variable — while the ts-node scripts here read .env
# directly and ignored the export. The migration and the seeds were therefore
# free to target different databases, which is how a column could be pushed and
# then be missing from the database a script talked to.
#
# Both variables are now derived from the one value in .env, so prisma, the
# seeds and the backfills cannot disagree. seed-terms-live.ts requires
# LIVE_DATABASE_URL and exits if it is unset, so it must still be exported.
# The credential is also no longer committed — this repository is public.
ENV_FILE="apps/backend/.env"
DB_URL="$(grep -E '^DATABASE_URL=' "$ENV_FILE" 2>/dev/null | head -1 | cut -d= -f2- \
  | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")"

if [ -z "$DB_URL" ]; then
  echo "ERROR: no DATABASE_URL in $ENV_FILE. Set it there before deploying." >&2
  exit 1
fi

export DATABASE_URL="$DB_URL"
export LIVE_DATABASE_URL="$DB_URL"
echo "Database: $(echo "$DB_URL" | sed -E 's#//[^:]+:[^@]+@#//***:***@#')"

# corepack resolves pnpm from the root package.json's "packageManager" field
# and downloads it if absent; without this it can stop to prompt on a
# non-interactive shell.
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# Install first, for the whole workspace. This used to run only inside
# apps/frontend and only after the backend had already been built and
# restarted, so any new backend dependency was missing at build time.
pnpm install --frozen-lockfile

cd apps/backend
npx prisma db push --accept-data-loss
npx prisma generate
npm run build
# Keep the database's permission catalogue in step with prisma/permissions.ts
# and attached to the Super Admin role. Only this was ever run on deploy, so a
# permission added in code never reached the database and the pages it gated
# stayed hidden. Steps 1-3 of that script are upserts; its blanket
# grant-everyone-Super-Admin step is opt-in via GRANT_SUPER_ADMIN_TO_ALL=1 and
# stays off here.
npx ts-node seed-permissions-live.ts
npx ts-node seed-terms-live.ts

cd ../frontend
pnpm run build

# Restart both only once everything has built successfully.
pm2 restart qmanager2-api
pm2 restart qmanager2-web

echo "Successfully deployed!"
echo
echo "Post-deploy steps that are NOT automated:"
echo "  1. Product thumbnails for rows created before the thumbnail change:"
echo "       cd apps/backend"
echo "       npx ts-node backfill-product-thumbnails.ts          # dry run"
echo "       npx ts-node backfill-product-thumbnails.ts --write"
echo "     Until this runs, older products show a placeholder in the catalogue"
echo "     and the quotation item picker. Their full images are untouched."
echo
echo "  2. nginx gzip: deploy/nginx/qmanager2.octolabs.cloud.conf has changed."
echo "     Compare it against the live vhost BEFORE copying — this host runs"
echo "     several apps and the upstream ports must match qmanager2-web/-api"
echo "     (4200/4201 as of this writing). Then:"
echo "       nginx -t && systemctl reload nginx"

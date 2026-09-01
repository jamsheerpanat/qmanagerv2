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

export DATABASE_URL="postgresql://qmanager_user:password@localhost:5432/qmanager_v2"
export LIVE_DATABASE_URL="postgresql://qmanager_user:password@localhost:5432/qmanager_v2"

# Install first, for the whole workspace. This used to run only inside
# apps/frontend and only after the backend had already been built and
# restarted, so any new backend dependency was missing at build time.
pnpm install --frozen-lockfile

cd apps/backend
npx prisma db push --accept-data-loss
npx prisma generate
npm run build
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
echo "     Copy it to /etc/nginx/sites-available/ and 'nginx -t && systemctl reload nginx'."

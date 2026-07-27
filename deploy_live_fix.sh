#!/bin/bash
cd /var/www/qmanager-v2
git pull origin main
cd apps/backend
export DATABASE_URL="postgresql://qmanager_user:password@localhost:5432/qmanager_v2"
export LIVE_DATABASE_URL="postgresql://qmanager_user:password@localhost:5432/qmanager_v2"
npx prisma db push --accept-data-loss
npx prisma generate
npm run build
npx ts-node seed-terms-live.ts
pm2 restart qmanager2-api
cd ../frontend
echo "NEXT_PUBLIC_APP_URL=https://qmanager2.octolabs.cloud" > .env
pnpm install
pnpm run build
pm2 restart qmanager2-web
echo "Successfully deployed!"

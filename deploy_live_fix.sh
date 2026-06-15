cd /var/www/qmanager-v2/apps/backend
export DATABASE_URL="postgresql://qmanager_user:password@localhost:5432/qmanager_v2"
npx prisma db push --accept-data-loss
export LIVE_DATABASE_URL="postgresql://qmanager_user:password@localhost:5432/qmanager_v2"
npx ts-node seed-terms-live.ts
pm2 restart qmanager2-api

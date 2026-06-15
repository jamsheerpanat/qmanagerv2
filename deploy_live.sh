cd /var/www/qmanager-v2
git pull origin main
cd apps/backend
npx prisma generate
npx prisma db push
npm run build
export LIVE_DATABASE_URL="postgresql://postgres:password@localhost:5436/qmanager?schema=public"
npx ts-node seed-terms-live.ts
pm2 restart qmanager2-api
pm2 restart qmanager2-web

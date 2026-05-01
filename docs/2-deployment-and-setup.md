# Deployment & Setup Guide

## Local Setup

### Requirements

- Node.js v20+
- pnpm v9+
- PostgreSQL v16+
- Redis (for BullMQ queues)
- MinIO (for file storage)

### Environment Variables

Both `apps/backend/.env` and `apps/frontend/.env` must be configured.
Reference the `.env.example` file in the repository root.
Key variables:

- `DATABASE_URL` (PostgreSQL)
- `JWT_SECRET`
- `REDIS_HOST`, `REDIS_PORT`
- `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`
- `NEXT_PUBLIC_API_URL` (for Frontend)

### Database Migrations

Run the following inside `apps/backend`:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

## Docker Production Setup

For production, use the `docker-compose.yml` file located in the root directory.

```bash
docker-compose up -d --build
```

This will spin up:

- PostgreSQL
- Redis
- MinIO (ensure bucket `qmanager-assets` is created via the MinIO console)
- Backend API (Port 3001)
- Frontend Next.js (Port 3000)

## Security & Hardening

- The API applies `helmet` and `express-rate-limit` to prevent basic abuse.
- In production, set proper CORS origins in `main.ts` rather than `*`.
- Ensure MinIO buckets are private; files should be served via presigned URLs or a backend proxy.

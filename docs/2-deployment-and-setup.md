# Deployment & Setup Guide

## Local Setup

### Requirements

- Node.js v20+
- pnpm v8.15+ (see `packageManager` in the root `package.json`)
- PostgreSQL v15+
- Redis — only needed if you enable the optional async PDF queue
- MinIO — only needed if you enable the optional async PDF queue

### Environment Variables

Copy `.env.example` in the repository root and split it into
`apps/backend/.env` and `apps/frontend/.env`. Key variables:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Signs access/refresh tokens — **must** be set in production |
| `INTERNAL_RENDER_SECRET` | Signs the PDF renderer's internal token (falls back to `JWT_SECRET`) |
| `FRONTEND_URL` | Where the API reaches Next.js, for headless rendering |
| `NEXT_PUBLIC_APP_URL` | Public app URL, used to build customer portal links |
| `CORS_ORIGINS` | Comma-separated browser origins allowed to call the API |
| `RATE_LIMIT_MAX` | Requests per IP per 15 minutes (default 1000) |
| `REDIS_HOST`, `REDIS_PORT` | BullMQ connection (port **6402** with the bundled compose file) |
| `ENABLE_PDF_QUEUE` | Set to `1` to turn on the async document pipeline |
| `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_USE_SSL`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET` | Object storage |
| `NEXT_PUBLIC_API_URL` | Frontend → API base URL |

### Infrastructure

`docker-compose.yml` provides Postgres, Redis and MinIO for local development.
Note the host port mappings, which are deliberately non-default to avoid
clashing with other projects:

| Service | Host port |
| --- | --- |
| PostgreSQL | 5436 |
| Redis | 6402 |
| MinIO API / console | 9002 / 9003 |

```bash
docker compose up -d
```

### Database Migrations

Run the following inside `apps/backend`:

```bash
npx prisma generate
npx prisma db push     # or: npx prisma migrate dev
npx prisma db seed
```

The seed creates the default company, branch, roles, the full permission set
(`prisma/permissions.ts`), and a Super Admin user.

> `prisma/permissions.ts` is the single source of truth for permission strings.
> Every action used in a `@RequirePermissions(...)` decorator must be listed
> there, or the endpoint becomes unreachable for every non-Super-Admin role.

### Running

```bash
./start.sh        # docker compose up -d && pnpm dev
```

Frontend on `:3000`, API on `:3001`.

## Production

The live deployment runs under PM2 as `qmanager2-api` and `qmanager2-web`.
See `deploy_live_fix.sh`.

## Security & Hardening

- The API applies `helmet` and `express-rate-limit` (default 1000 requests per
  IP per 15 minutes, tunable via `RATE_LIMIT_MAX`).
- CORS uses an explicit allowlist from `CORS_ORIGINS`. A wildcard is not
  possible here: the API sends credentials, and browsers reject `*` combined
  with `credentials: true`.
- `JWT_SECRET` and `INTERNAL_RENDER_SECRET` have insecure development
  fallbacks. Set both explicitly in production.
- The `/internal/*` endpoints return full records including unit costs and
  margins. They accept either a short-lived HMAC render token minted by
  `PdfService` or a valid user JWT — never a static header.
- MinIO buckets should stay private; files are served via presigned URLs or
  proxied through the backend.

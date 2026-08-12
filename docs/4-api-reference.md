# API Reference & Security

All API routes are served from the root (e.g. `http://localhost:3001/auth/login`).

## Authentication

- **POST `/auth/login`** — accepts `email` and `password`, returns
  `access_token` (15 min) and `refresh_token` (7 days).
- **POST `/auth/refresh`** — accepts `userId` and `refreshToken`.
- **POST `/auth/logout`**
- **GET `/auth/me`** — returns the profile plus flattened `roles` (names) and
  `permissions` (action strings).

Pass the token as `Authorization: Bearer <token>` on all protected routes.

## Permissions

The API uses a declarative `@RequirePermissions('domain.action')` decorator,
enforced by `PermissionsGuard`.

> A controller must apply **both** guards —
> `@UseGuards(JwtAuthGuard, PermissionsGuard)`. With `JwtAuthGuard` alone the
> decorators are silently inert and every authenticated user passes.

Users holding the `Super Admin` role bypass the check. `PermissionsGuard`
attaches the resolved `permissions` array and an `isSuperAdmin` flag to
`req.user` for controllers that scope their own queries.

`quotations.view_all` is one such scope: without it, `GET /quotations` returns
only quotations the caller created.

The canonical permission list lives in `apps/backend/prisma/permissions.ts`.

## Customer Portal (public, token-based)

These endpoints do **not** require a JWT; they rely on secure share tokens:

- **GET `/portal/quotations/:token`**
- **POST `/portal/quotations/:token/accept`** — digital signature capture
- **POST `/portal/quotations/:token/reject`**
- **GET `/portal/invoices/:token`**
- **POST `/portal/invoices/:token/payment-proof`**
- **GET `/portal/verify/:token`** — document integrity check for QR scans

## Internal render endpoints

- **GET `/internal/quotations/:id`**
- **GET `/internal/invoices/:id`**

Used by the headless PDF renderer and the dashboard's Live Preview iframe.
They return the complete record — including `unitCost`, `totalCost` and
`grossMargin` — and are protected by `InternalRenderGuard`, which accepts
either a short-lived HMAC render token (injected by Playwright at the browser
context level) or a valid user JWT.

## Rate Limiting

Default 1000 requests per IP per 15 minutes, configurable via `RATE_LIMIT_MAX`.

## Core Modules

- **`/quotations`** — CRUD, revisions, item/scope/term replacement, approval
  workflow, readiness scoring, share links, PDF download.
- **`/invoices`** — creation from quotations, issuing, payments, balances, PDF.
- **`/catalog`** — service types, categories, products, service items.
- **`/terms`** — terms categories, templates and groups.
- **`/reports`** — dashboard KPIs, charts, and CSV export.
- **`/pdf`** — async sample generation. Only registered when
  `ENABLE_PDF_QUEUE=1`.

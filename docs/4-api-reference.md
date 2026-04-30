# API Reference & Security

All API routes are prefixed with `/` (e.g. `http://localhost:3001/auth/login`).

## Authentication
- **POST `/auth/login`**: Accepts `email` and `password`, returns a JWT Bearer token.
- Pass token in `Authorization: Bearer <token>` for all protected routes.

## Permissions Guard
The API uses a declarative `@RequirePermissions('domain.action')` decorator.
Users must have a `Role` with the required permission strings to access endpoints.

## Customer Portal (Public / Token-based)
These endpoints do **not** require a JWT, but rely on secure tokens:
- **GET `/portal/verify/:token`**: Verify document integrity (QR code scans).
- **GET `/portal/quotations/:token`**: View quotation details.
- **POST `/portal/quotations/:token/accept`**: Digitally sign and accept.
- **POST `/portal/invoices/:token/payment-proof`**: Upload payment receipt.

## Rate Limiting
The API enforces a rate limit of 100 requests per 15 minutes per IP by default to prevent brute forcing and denial of service.

## Core Modules
- **`/quotations`**: CRUD for quotes, revisions, item management, and approval workflows.
- **`/invoices`**: Financials, payment tracking, balance calculations.
- **`/catalog`**: Master data (Products, Service Items, Templates).
- **`/reports`**: Dashboard KPIs and CSV generation.

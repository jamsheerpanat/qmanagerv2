# Architecture & PDF Engine

## Monorepo Structure

QManager v2 uses a Turborepo/PNPM workspace setup:

- `apps/backend`: NestJS 11 application, Prisma 7 ORM, REST API.
- `apps/frontend`: Next.js 16 (App Router), React 19, TailwindCSS v4, Zustand.
- `packages/pdf-templates`: Shared React components dedicated strictly to PDF layout structures.

## Database Design

Key tables:

- **Customer / Lead**: The origin of the sales cycle.
- **Quotation / QuotationItem / QuotationTerm**: Document generation.
- **Invoice / Payment**: Financial settlement.
- **Notification**: Real-time events engine.
- **SystemSetting / AiPromptTemplate**: Configuration.

## PDF Generation Engine (Puppeteer + Next.js)

Unlike traditional backend PDF generators (like `pdfkit` or `wkhtmltopdf`), QManager v2 leverages its own Next.js frontend to render pixel-perfect designs.

Rendering is driven by **Playwright** (Chromium), not Puppeteer.

### Synchronous flow (the default, used by "Generate PDF")

1. User clicks "Generate PDF" in the UI.
2. `PdfService.generatePdfSync` maps the quotation's ServiceType slug to a
   template route and launches headless Chromium.
3. The browser context carries a short-lived `x-internal-render-token` header.
4. Chromium navigates to `/render-pdf/:template?quotationId=...`.
5. That page fetches `/internal/quotations/:id` — the render token rides along
   on the request and satisfies `InternalRenderGuard`.
6. `page.pdf()` captures A4 output, which is streamed straight back to the
   browser as a download. Nothing is persisted.

The same `/render-pdf/*` routes back the dashboard's Live Preview iframe. In
that case there is no render token, so the page forwards the signed-in user's
JWT instead.

### Asynchronous flow (optional, `ENABLE_PDF_QUEUE=1`)

1. `POST /pdf/sample-quotation` creates a `Document` row and enqueues a BullMQ
   job on `pdf-generation`.
2. `pdf.processor.ts` renders the same way, then hashes the output (SHA-256),
   uploads it to MinIO, marks the Document `PUBLISHED` and creates a
   `DocumentVerification` token for QR verification.

This pipeline is off by default so the API does not require a reachable Redis
in order to boot.

This architecture ensures that PDFs always match the exact styling tokens, fonts, and layouts defined in the shared React frontend.

# Architecture & PDF Engine

## Monorepo Structure

QManager v2 uses a Turborepo/PNPM workspace setup:

- `apps/backend`: NestJS application, Prisma ORM, REST API.
- `apps/frontend`: Next.js 14 (App Router), React, TailwindCSS, Zustand.
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

### Flow

1. User clicks "Generate PDF" in the UI.
2. The Backend queues a BullMQ job (`pdf-queue`).
3. The BullMQ worker (`pdf.processor.ts`) launches a Headless Chrome instance via Puppeteer.
4. Puppeteer navigates to the hidden frontend route `/render-pdf/:service-slug?quotationId=...`.
5. The Next.js page fetches the quotation data and renders a beautiful, print-ready HTML page.
6. Puppeteer captures this HTML as a `.pdf` file.
7. The Backend uploads the PDF to MinIO, updates the Document record, and notifies the user via WebSockets/SSE/Notifications.

This architecture ensures that PDFs always match the exact styling tokens, fonts, and layouts defined in the shared React frontend.

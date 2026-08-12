import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { chromium } from 'playwright';
import * as crypto from 'crypto';

/**
 * Service-type slug -> /render-pdf route segment. Slugs that are not listed
 * fall through to a route of the same name.
 */
export const SERVICE_TEMPLATE_ROUTES: Record<string, string> = {
  'home-automation': 'home-automation',
  'smart-home': 'home-automation',
  'smart-home-automation': 'home-automation',
  'building-automation': 'building-automation',
  bms: 'building-automation',
  'software-development': 'software-development',
  software: 'software-development',
  'web-development': 'software-development',
  'it-infrastructure': 'it-infrastructure',
  'it-infra': 'it-infrastructure',
  network: 'it-infrastructure',
};

export function resolveTemplateRoute(templateId: string): string {
  return SERVICE_TEMPLATE_ROUTES[templateId] || templateId;
}

export function frontendBaseUrl(): string {
  return process.env.FRONTEND_URL || 'http://localhost:3000';
}

/** Render tokens are short-lived; a PDF render takes seconds, not minutes. */
const RENDER_TOKEN_TTL_MS = 2 * 60 * 1000;

@Injectable()
export class PdfService {
  /**
   * Secret backing the internal render token. Falls back to JWT_SECRET so an
   * existing deployment keeps working without new configuration.
   */
  private renderSecret(): string {
    return (
      process.env.INTERNAL_RENDER_SECRET ||
      process.env.JWT_SECRET ||
      'super-secret-key'
    );
  }

  /**
   * Mints a stateless, expiring credential that proves a request came from our
   * own headless renderer. Stateless (HMAC over the expiry) rather than an
   * in-memory set, so it still works if the API runs more than one instance.
   */
  issueRenderToken(ttlMs: number = RENDER_TOKEN_TTL_MS): string {
    const expiry = String(Date.now() + ttlMs);
    const signature = crypto
      .createHmac('sha256', this.renderSecret())
      .update(expiry)
      .digest('hex');
    return `${expiry}.${signature}`;
  }

  isValidRenderToken(token?: string): boolean {
    if (!token) return false;

    const separator = token.indexOf('.');
    if (separator <= 0) return false;

    const expiryRaw = token.slice(0, separator);
    const signature = token.slice(separator + 1);

    const expiry = Number(expiryRaw);
    if (!Number.isFinite(expiry) || expiry < Date.now()) return false;

    const expected = crypto
      .createHmac('sha256', this.renderSecret())
      .update(expiryRaw)
      .digest('hex');

    const provided = Buffer.from(signature, 'hex');
    const expectedBuf = Buffer.from(expected, 'hex');
    if (provided.length !== expectedBuf.length) return false;

    return crypto.timingSafeEqual(provided, expectedBuf);
  }

  async generatePdfSync(
    templateId: string,
    queryId: string,
    idParamName: 'quotationId' | 'invoiceId' = 'quotationId',
  ): Promise<Buffer> {
    const routeSegment = resolveTemplateRoute(templateId);
    const renderUrl = `${frontendBaseUrl()}/render-pdf/${routeSegment}?${idParamName}=${queryId}`;

    let browser:
      | Awaited<ReturnType<(typeof chromium)['launch']>>
      | undefined;

    try {
      browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
      });

      // The header is attached at the context level so it rides along on the
      // page's cross-origin XHR back to /internal/*, which is what actually
      // needs to authenticate.
      const context = await browser.newContext({
        extraHTTPHeaders: {
          'x-internal-render-token': this.issueRenderToken(),
        },
      });
      const page = await context.newPage();

      await page.goto(renderUrl, { waitUntil: 'networkidle', timeout: 30000 });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      });

      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error(`Error generating PDF synchronously:`, error);
      throw new InternalServerErrorException('Failed to generate PDF');
    } finally {
      // Previously the browser was only closed on the success path, so every
      // failed render leaked a Chromium process.
      await browser?.close().catch(() => undefined);
    }
  }
}

import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { chromium, type Browser } from 'playwright';
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

/**
 * Where the headless renderer should load the /render-pdf pages from.
 *
 * The old fallback was a bare `http://localhost:3000`, which is only correct if
 * this app happens to own that port. On a shared host it does not: QManager's
 * web app listens elsewhere and 3000 belongs to a different application
 * entirely, so the renderer navigated to someone else's site and produced a PDF
 * of it — or failed outright when no /render-pdf route existed there.
 *
 * NEXT_PUBLIC_APP_URL is the app's own public origin and is already configured,
 * so it is a far safer second choice than guessing a port.
 */
export function frontendBaseUrl(): string {
  const configured =
    process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/+$/, '');

  new Logger('PdfService').warn(
    'Neither FRONTEND_URL nor NEXT_PUBLIC_APP_URL is set; falling back to ' +
      'http://localhost:3000, which on a shared host may be a different app.',
  );
  return 'http://localhost:3000';
}

/** Render tokens are short-lived; a PDF render takes seconds, not minutes. */
const RENDER_TOKEN_TTL_MS = 2 * 60 * 1000;

/** How long to wait for a render page to signal it is ready to print. */
const PDF_READY_TIMEOUT_MS = 30000;

@Injectable()
export class PdfService implements OnModuleDestroy {
  private readonly logger = new Logger(PdfService.name);

  /**
   * Chromium is launched once and shared. A cold launch costs hundreds of
   * milliseconds and every PDF used to pay it; renders are isolated from one
   * another by using a fresh browser context per render instead.
   */
  private browserPromise?: Promise<Browser>;

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

    const browser = await this.getBrowser();

    // The header is attached at the context level so it rides along on the
    // page's cross-origin XHR back to /internal/*, which is what actually
    // needs to authenticate.
    const context = await browser.newContext({
      extraHTTPHeaders: {
        'x-internal-render-token': this.issueRenderToken(),
      },
    });

    try {
      const page = await context.newPage();

      await page.goto(renderUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      // The render pages mark their root with data-pdf-ready once they have
      // left their loading state, which is a far cheaper signal than waiting
      // for the network to fall idle. A template without the marker falls back
      // to the original behaviour rather than failing.
      // Race the two readiness signals rather than trying one and then the
      // other: a marked template settles as soon as its root appears, and a
      // template without the marker still finishes on network idle instead of
      // first burning the whole marker timeout. Whichever lands first wins.
      const marker = page.waitForSelector('[data-pdf-ready]', {
        timeout: PDF_READY_TIMEOUT_MS,
      });
      const idle = page.waitForLoadState('networkidle', {
        timeout: PDF_READY_TIMEOUT_MS,
      });
      // Attach handlers up front so the losing promise's rejection is never
      // an unhandled rejection.
      marker.catch(() => undefined);
      idle.catch(() => undefined);

      try {
        await Promise.any([marker, idle]);
      } catch {
        throw new Error(
          `Render page never became ready within ${PDF_READY_TIMEOUT_MS}ms: ${renderUrl}`,
        );
      }

      // Printing before webfonts settle produces a PDF in fallback faces.
      await page
        .evaluate(() => document.fonts.ready.then(() => undefined))
        .catch(() => undefined);

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      });

      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error(`Error generating PDF synchronously: ${String(error)}`);
      throw new InternalServerErrorException('Failed to generate PDF');
    } finally {
      // Only the context is disposed — the browser is shared and stays up.
      await context.close().catch(() => undefined);
    }
  }

  /**
   * Returns the shared browser, launching it on first use. If a previous
   * instance died (crash, OOM kill) the next call transparently relaunches.
   */
  private async getBrowser(): Promise<Browser> {
    const existing = await this.browserPromise?.catch(() => undefined);
    if (existing?.isConnected()) return existing;

    this.browserPromise = chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    try {
      return await this.browserPromise;
    } catch (error) {
      // Do not cache a rejected promise, or every later render fails too.
      this.browserPromise = undefined;
      throw error;
    }
  }

  async onModuleDestroy() {
    const browser = await this.browserPromise?.catch(() => undefined);
    await browser?.close().catch(() => undefined);
  }
}

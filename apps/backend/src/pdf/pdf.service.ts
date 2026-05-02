import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { chromium } from 'playwright';

@Injectable()
export class PdfService {
  async generatePdfSync(
    templateId: string,
    queryId: string,
    idParamName: 'quotationId' | 'invoiceId' = 'quotationId',
  ): Promise<Buffer> {
    const SERVICE_TEMPLATE_ROUTES: Record<string, string> = {
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

    const routeSegment = SERVICE_TEMPLATE_ROUTES[templateId] || templateId;
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:4201';
    // Remove docId, just use the queryId (quotationId or invoiceId)
    const renderUrl = `${baseUrl}/render-pdf/${routeSegment}?${idParamName}=${queryId}`;

    try {
      const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });
      const page = await browser.newPage();

      await page.goto(renderUrl, { waitUntil: 'networkidle', timeout: 30000 });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      });

      await browser.close();

      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error(`Error generating PDF synchronously:`, error);
      throw new InternalServerErrorException('Failed to generate PDF');
    }
  }
}

import {
  Controller,
  Get,
  Param,
  Headers,
  ForbiddenException,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';

/**
 * Internal-only controller used by the Playwright PDF renderer.
 * No JWT auth guard — access is restricted by checking for the
 * x-internal-pdf-render header (only set by our own render-pdf pages).
 */
@Controller('internal/invoices')
export class InvoicesInternalController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get(':id')
  async findOneForPdf(
    @Param('id') id: string,
    @Headers('x-internal-pdf-render') internalHeader: string,
  ) {
    if (internalHeader !== '1') {
      throw new ForbiddenException('Access denied');
    }
    return this.invoicesService.findOne(id);
  }
}

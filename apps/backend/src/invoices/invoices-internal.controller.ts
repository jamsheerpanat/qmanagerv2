import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InternalRenderGuard } from '../common/guards/internal-render.guard';

/**
 * Internal-only controller used by the PDF renderer and the dashboard's Live
 * Preview iframe. Access requires either a short-lived render token minted by
 * PdfService or a valid user JWT — see InternalRenderGuard.
 */
@UseGuards(InternalRenderGuard)
@Controller('internal/invoices')
export class InvoicesInternalController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get(':id')
  async findOneForPdf(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }
}

import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { InternalRenderGuard } from '../common/guards/internal-render.guard';

/**
 * Internal-only controller used by the PDF renderer and the dashboard's Live
 * Preview iframe. Access requires either a short-lived render token minted by
 * PdfService or a valid user JWT — see InternalRenderGuard.
 */
@UseGuards(InternalRenderGuard)
@Controller('internal/quotations')
export class QuotationsInternalController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Get(':id')
  async findOneForPdf(@Param('id') id: string) {
    return this.quotationsService.findOne(id);
  }
}

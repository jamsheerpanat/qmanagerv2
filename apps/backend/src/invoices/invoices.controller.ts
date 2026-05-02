import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  UseGuards,
  Query,
  Res,
  Delete,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import {
  CreateInvoiceDto,
  RecordPaymentDto,
  InvoiceItemDto,
} from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { InvoiceType } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @RequirePermissions('invoices.create')
  @Post()
  create(@Body() dto: CreateInvoiceDto, @Req() req: any) {
    return this.invoicesService.create(dto, req.user.id);
  }

  @RequirePermissions('invoices.create')
  @Post('from-quotation/:quotationId')
  createFromQuotation(
    @Param('quotationId') quotationId: string,
    @Body('invoiceType') type: InvoiceType,
    @Req() req: any,
  ) {
    return this.invoicesService.createFromQuotation(
      quotationId,
      type || InvoiceType.QUOTATION,
      req.user.id,
    );
  }

  @RequirePermissions('invoices.view')
  @Get()
  findAll(@Req() req: any, @Query() filters: any) {
    return this.invoicesService.findAll(req.user.companyId, filters);
  }

  @RequirePermissions('invoices.view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @RequirePermissions('invoices.update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoicesService.update(id, dto);
  }

  @RequirePermissions('invoices.update')
  @Patch(':id/items')
  updateItems(@Param('id') id: string, @Body() items: InvoiceItemDto[]) {
    return this.invoicesService.replaceItems(id, items);
  }

  @RequirePermissions('invoices.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invoicesService.remove(id);
  }

  @RequirePermissions('invoices.create')
  @Post(':id/issue')
  issue(@Param('id') id: string) {
    return this.invoicesService.issue(id);
  }

  @RequirePermissions('invoices.record_payment')
  @Post(':id/payments')
  recordPayment(
    @Param('id') id: string,
    @Body() dto: RecordPaymentDto,
    @Req() req: any,
  ) {
    return this.invoicesService.recordPayment(id, dto, req.user.id);
  }

  @RequirePermissions('invoices.generate_pdf')
  @Post(':id/generate-pdf')
  async generatePdf(@Param('id') id: string, @Req() req: any, @Res() res: any) {
    const pdfBuffer = await this.invoicesService.generatePdf(id, req.user.id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice-${id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  }
}

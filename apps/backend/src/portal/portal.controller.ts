import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { PortalService } from './portal.service';

@Controller('portal')
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Get('quotations/:token')
  getQuotationByToken(@Param('token') token: string, @Req() req: any) {
    const ip = req.ip || req.connection?.remoteAddress;
    const ua = req.headers['user-agent'];
    return this.portalService.getQuotationByToken(token, ip, ua);
  }

  @Post('quotations/:token/accept')
  acceptQuotation(
    @Param('token') token: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const ip = req.ip || req.connection?.remoteAddress;
    const ua = req.headers['user-agent'];
    return this.portalService.acceptQuotation(token, body, ip, ua);
  }

  @Post('quotations/:token/reject')
  rejectQuotation(
    @Param('token') token: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const ip = req.ip || req.connection?.remoteAddress;
    const ua = req.headers['user-agent'];
    return this.portalService.rejectQuotation(token, body, ip, ua);
  }

  @Get('invoices/:token')
  getInvoiceByToken(@Param('token') token: string, @Req() req: any) {
    const ip = req.ip || req.connection?.remoteAddress;
    const ua = req.headers['user-agent'];
    return this.portalService.getInvoiceByToken(token, ip, ua);
  }

  @Post('invoices/:token/payment-proof')
  uploadPaymentProof(@Param('token') token: string, @Body() body: any) {
    return this.portalService.uploadPaymentProof(token, body);
  }

  @Get('verify/:token')
  verifyDocument(@Param('token') token: string) {
    return this.portalService.verifyDocument(token);
  }
}

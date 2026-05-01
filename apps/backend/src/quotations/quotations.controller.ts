import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  Res,
} from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import {
  CreateQuotationDto,
  QuotationItemDto,
  QuotationScopeDto,
  QuotationTermDto,
} from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('quotations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @RequirePermissions('quotations.create')
  @Post()
  create(@Body() createQuotationDto: CreateQuotationDto, @Req() req: any) {
    return this.quotationsService.create(createQuotationDto, req.user?.id);
  }

  @RequirePermissions('quotations.view')
  @Get()
  findAll(@Req() req: any, @Query() query: any) {
    const { companyId, id, permissions } = req.user;

    // If the user does not have view_all permission, restrict to their own quotations
    if (!permissions || !permissions.includes('quotations.view_all')) {
      query.createdById = id;
    }

    return this.quotationsService.findAll(companyId, query);
  }

  @RequirePermissions('quotations.view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotationsService.findOne(id);
  }

  @RequirePermissions('quotations.update')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuotationDto: UpdateQuotationDto,
  ) {
    return this.quotationsService.update(id, updateQuotationDto);
  }

  @RequirePermissions('quotations.update')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quotationsService.remove(id);
  }

  @RequirePermissions('quotations.update')
  @Post(':id/items')
  replaceItems(@Param('id') id: string, @Body() itemsDto: QuotationItemDto[]) {
    return this.quotationsService.replaceItems(id, itemsDto);
  }

  @RequirePermissions('quotations.update')
  @Patch(':id/scope')
  replaceScopes(
    @Param('id') id: string,
    @Body() scopesDto: QuotationScopeDto[],
  ) {
    return this.quotationsService.replaceScopes(id, scopesDto);
  }

  @RequirePermissions('quotations.update')
  @Post(':id/terms')
  replaceTerms(@Param('id') id: string, @Body() termsDto: QuotationTermDto[]) {
    return this.quotationsService.replaceTerms(id, termsDto);
  }

  @RequirePermissions('quotations.approve')
  @Post(':id/submit-for-approval')
  submitForApproval(@Param('id') id: string, @Req() req: any) {
    return this.quotationsService.submitForApproval(id, req.user?.id);
  }

  @RequirePermissions('quotations.approve')
  @Post(':id/approve')
  approve(
    @Param('id') id: string,
    @Req() req: any,
    @Body('comments') comments: string,
  ) {
    return this.quotationsService.approve(id, req.user?.id, comments);
  }

  @RequirePermissions('quotations.approve')
  @Post(':id/reject')
  reject(
    @Param('id') id: string,
    @Req() req: any,
    @Body('comments') comments: string,
  ) {
    return this.quotationsService.reject(id, req.user?.id, comments);
  }

  @RequirePermissions('quotations.revise')
  @Post(':id/create-revision')
  createRevision(@Param('id') id: string, @Req() req: any) {
    return this.quotationsService.createRevision(id, req.user?.id);
  }

  @RequirePermissions('quotations.view')
  @Get(':id/compare/:toId')
  compareRevisions(@Param('id') id: string, @Param('toId') toId: string) {
    return this.quotationsService.compareRevisions(id, toId);
  }

  @RequirePermissions('quotations.send')
  @Post(':id/send')
  sendQuotation(
    @Param('id') id: string,
    @Body('recipientEmail') email: string,
    @Req() req: any,
  ) {
    return this.quotationsService.sendQuotation(id, email, req.user?.id);
  }

  @RequirePermissions('quotations.generate_pdf')
  @Post(':id/generate-pdf')
  async generatePdf(@Param('id') id: string, @Req() req: any, @Res() res: any) {
    const pdfBuffer = await this.quotationsService.generatePdf(id, req.user?.id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=quotation-${id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  }

  @RequirePermissions('quotations.view')
  @Get(':id/readiness')
  checkReadiness(@Param('id') id: string) {
    return this.quotationsService.checkReadiness(id);
  }

  @RequirePermissions('quotations.update')
  @Post(':id/ai-summarize')
  aiSummarize(@Param('id') id: string) {
    return this.quotationsService.aiSummarize(id);
  }
}

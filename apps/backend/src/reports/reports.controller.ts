import { Controller, Get, Query, Req, UseGuards, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Parser } from 'json2csv';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  getDashboardKpis(@Req() req: any) {
    return this.reportsService.getDashboardKpis(req.user.companyId);
  }

  @Get('charts')
  getDashboardCharts(@Req() req: any) {
    return this.reportsService.getDashboardCharts(req.user.companyId);
  }

  @Get(':type')
  @RequirePermissions('reports.view')
  async getReport(
    @Req() req: any, 
    @Query('type') type: string, 
    @Query() filters: any,
    @Res() res: any
  ) {
    const data = await this.reportsService.getReportData(req.user.companyId, type, filters);

    if (filters.export === 'csv') {
      const parser = new Parser();
      const csv = parser.parse(data);
      res.header('Content-Type', 'text/csv');
      res.attachment(`report-${type}-${new Date().toISOString().split('T')[0]}.csv`);
      return res.send(csv);
    }

    return res.json(data);
  }
}

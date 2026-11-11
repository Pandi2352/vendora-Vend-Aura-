import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SalesReportsService, ExecutiveOverviewResult } from './sales-reports.service';
import { GstReportsService, Gstr1SummaryResult, Gstr3bSummaryResult } from './gst-reports.service';
import { InventoryReportsService, InventoryValuationResult } from './inventory-reports.service';
import { ReportsQueryDto } from './dto/reports-query.dto';
import { TenantId } from '../../common';

@ApiTags('Business Analytics & GST Tax Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly salesReportsService: SalesReportsService,
    private readonly gstReportsService: GstReportsService,
    private readonly inventoryReportsService: InventoryReportsService,
  ) {}

  @Get('executive')
  @ApiOperation({ summary: 'Executive Overview KPI summary, tender breakdown and trends' })
  async getExecutiveOverview(
    @Query() query: ReportsQueryDto,
    @TenantId() tenantId: string,
  ): Promise<{ success: boolean; data: ExecutiveOverviewResult }> {
    const data = await this.salesReportsService.getExecutiveOverview(tenantId, query);
    return { success: true, data };
  }

  @Get('gst/gstr-1')
  @ApiOperation({ summary: 'GSTR-1 Outward Supplies Summary (B2B, B2C, Tax Slabs)' })
  async getGstr1(
    @Query() query: ReportsQueryDto,
    @TenantId() tenantId: string,
  ): Promise<{ success: boolean; data: Gstr1SummaryResult }> {
    const data = await this.gstReportsService.getGstr1Summary(tenantId, query);
    return { success: true, data };
  }

  @Get('gst/gstr-3b')
  @ApiOperation({ summary: 'GSTR-3B Monthly Return Summary (Outward vs Eligible ITC)' })
  async getGstr3b(
    @Query() query: ReportsQueryDto,
    @TenantId() tenantId: string,
  ): Promise<{ success: boolean; data: Gstr3bSummaryResult }> {
    const data = await this.gstReportsService.getGstr3bSummary(tenantId, query);
    return { success: true, data };
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Inventory Valuation (Cost vs Retail), Dead Stock & Low Stock Warnings' })
  async getInventoryValuation(
    @TenantId() tenantId: string,
  ): Promise<{ success: boolean; data: InventoryValuationResult }> {
    const data = await this.inventoryReportsService.getInventoryValuation(tenantId);
    return { success: true, data };
  }
}


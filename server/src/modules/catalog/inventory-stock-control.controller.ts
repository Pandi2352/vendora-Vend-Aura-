import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, TenantId } from '../../common';
import { InventoryStockControlService } from './inventory-stock-control.service';
import { CreateWastageDto, ReconcileAuditDto, StockLedgerQueryDto } from './dto/stock-control.dto';

@ApiTags('Stock Control, Movement Ledger, Physical Audit & Wastage')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryStockControlController {
  constructor(private readonly stockControlService: InventoryStockControlService) {}

  @Get('ledger')
  @ApiOperation({ summary: 'Get stock movement audit ledger' })
  async getMovementLedger(
    @TenantId() tenantId: string,
    @Query() query: StockLedgerQueryDto,
  ) {
    return this.stockControlService.getMovementLedger(tenantId, query);
  }

  @Post('wastage')
  @ApiOperation({ summary: 'Record spoiled or damaged stock write-off' })
  async logWastage(
    @TenantId() tenantId: string,
    @Body() dto: CreateWastageDto,
    @CurrentUser('fullName') user: string,
  ) {
    const data = await this.stockControlService.logWastage(tenantId, dto, user || 'Staff');
    return { message: 'Stock wastage recorded and written off', data };
  }

  @Get('wastage')
  @ApiOperation({ summary: 'List recorded stock wastages and write-offs' })
  async listWastage(@TenantId() tenantId: string) {
    return { data: await this.stockControlService.listWastage(tenantId) };
  }

  @Get('audit/sheet')
  @ApiOperation({ summary: 'Get active catalog stock count sheet for physical audit' })
  async getAuditSheet(@TenantId() tenantId: string) {
    return { data: await this.stockControlService.getAuditSheet(tenantId) };
  }

  @Post('audit/reconcile')
  @ApiOperation({ summary: 'Reconcile physical inventory counts against system stock' })
  async reconcileAudit(
    @TenantId() tenantId: string,
    @Body() dto: ReconcileAuditDto,
    @CurrentUser('fullName') user: string,
  ) {
    const data = await this.stockControlService.reconcileAudit(tenantId, dto, user || 'Store Manager');
    return { message: `Physical stock reconciled (${data.auditNumber})`, data };
  }

  @Get('audit/history')
  @ApiOperation({ summary: 'List past physical inventory audits' })
  async listAudits(@TenantId() tenantId: string) {
    return { data: await this.stockControlService.listAudits(tenantId) };
  }
}

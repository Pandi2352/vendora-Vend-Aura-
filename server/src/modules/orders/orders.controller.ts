import { Controller, Post, Get, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { OrderReturnsService } from './order-returns.service';
import { CashDrawerService } from './cash-drawer.service';
import { OfflineSyncService } from './offline-sync.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateReturnDto } from './dto/create-return.dto';
import { SyncOfflineOrdersDto } from './dto/sync-offline.dto';
import { OpenShiftDto } from './dto/open-shift.dto';
import { CloseShiftDto } from './dto/close-shift.dto';
import {
  AuthenticatedUser,
  CurrentUser,
  PaginationDto,
  ParseObjectIdPipe,
  ROLE_GROUPS,
  Roles,
  TenantId,
} from '../../common';

@ApiTags('Orders, POS, Returns & Cash Drawer')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly orderReturnsService: OrderReturnsService,
    private readonly cashDrawerService: CashDrawerService,
    private readonly offlineSyncService: OfflineSyncService,
  ) {}

  @Post('sync-offline')
  @ApiOperation({ summary: 'Batch sync offline orders recorded locally on the POS counter' })
  @ApiResponse({ status: 200, description: 'Offline queue processed and synchronized' })
  async syncOffline(
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SyncOfflineOrdersDto,
  ) {
    const data = await this.offlineSyncService.syncOfflineOrders(tenantId, dto, user);
    return { message: `Synced ${data.synced.length} offline orders`, data };
  }

  @Post()
  @ApiOperation({ summary: 'Finalize POS order: server-priced, stock deducted, sequential invoice' })
  @ApiResponse({ status: 201, description: 'Order completed and stock deducted successfully' })
  async createOrder(
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateOrderDto,
  ) {
    const data = await this.ordersService.createOrder(tenantId, dto, user);
    return { message: `Invoice ${data.invoiceNumber} saved`, data };
  }

  @Get()
  @ApiOperation({ summary: 'List recent orders for the shop' })
  async getOrders(
    @TenantId() tenantId: string,
    @Query() query: PaginationDto,
  ) {
    return this.ordersService.getOrders(tenantId, query);
  }

  @Get('ledger')
  @Roles(...ROLE_GROUPS.FINANCE)
  @ApiOperation({ summary: 'List stock ledger movement records for audit' })
  async getLedger(
    @TenantId() tenantId: string,
    @Query() query: PaginationDto,
  ) {
    return this.ordersService.getLedger(tenantId, query);
  }

  // ---- RETURNS & EXCHANGES ----
  @Post('returns')
  @ApiOperation({ summary: 'Process a sales return; refund is computed from the invoice (incl. GST)' })
  async createReturn(
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateReturnDto,
  ) {
    const data = await this.orderReturnsService.createReturn(tenantId, dto, user);
    return { message: `Return ${data.returnNumber} processed`, data };
  }

  @Get('returns')
  @ApiOperation({ summary: 'List processed order returns' })
  async getReturns(
    @TenantId() tenantId: string,
    @Query() query: PaginationDto,
  ) {
    return this.orderReturnsService.getReturns(tenantId, query);
  }

  @Get('returns/invoice/:invoiceNumber')
  @ApiOperation({ summary: 'Invoice lookup for returns: order, past returns and returnable quantities' })
  async getReturnsByInvoice(@TenantId() tenantId: string, @Param('invoiceNumber') invoiceNumber: string) {
    return { data: await this.orderReturnsService.getInvoiceReturnInfo(tenantId, invoiceNumber) };
  }

  // ---- CASH DRAWER & SHIFT MANAGEMENT ----
  @Post('shifts/open')
  @ApiOperation({ summary: 'Open cashier drawer shift with float amount' })
  async openShift(
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: OpenShiftDto,
  ) {
    const result = await this.cashDrawerService.openShift(tenantId, dto, user);
    return {
      message: result.isExisting ? 'A shift is already open' : `Shift ${result.shift.shiftNumber} opened`,
      data: result.shift,
    };
  }

  @Get('shifts/current')
  @ApiOperation({ summary: 'Get active shift summary and live cash figures (null when closed)' })
  async getCurrentShift(@TenantId() tenantId: string) {
    return { data: await this.cashDrawerService.getCurrentShift(tenantId) };
  }

  @Post('shifts/close')
  @ApiOperation({ summary: 'Close shift, input actual counted cash, and compute variance' })
  async closeShift(@TenantId() tenantId: string, @Body() dto: CloseShiftDto) {
    const result = await this.cashDrawerService.closeShift(tenantId, dto);
    return { message: `Shift ${result.shift.shiftNumber} closed`, data: result.shift };
  }

  @Get('shifts/history')
  @ApiOperation({ summary: 'List past cash drawer shifts' })
  async getShiftHistory(
    @TenantId() tenantId: string,
    @Query() query: PaginationDto,
  ) {
    return this.cashDrawerService.getShiftHistory(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single order receipt details' })
  async getOrderById(@TenantId() tenantId: string, @Param('id', ParseObjectIdPipe) id: string) {
    return { data: await this.ordersService.getOrderById(tenantId, id) };
  }
}

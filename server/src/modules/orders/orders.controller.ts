import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { OrderReturnsService } from './order-returns.service';
import { CashDrawerService } from './cash-drawer.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateReturnDto } from './dto/create-return.dto';
import { OpenShiftDto } from './dto/open-shift.dto';
import { CloseShiftDto } from './dto/close-shift.dto';
import { CurrentUser } from '../../common';

@ApiTags('Orders, POS, Returns & Cash Drawer')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly orderReturnsService: OrderReturnsService,
    private readonly cashDrawerService: CashDrawerService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Finalize POS order and generate sequential invoice' })
  @ApiResponse({ status: 201, description: 'Order completed and stock deducted successfully' })
  async createOrder(
    @Body() dto: CreateOrderDto,
    @CurrentUser() authUser: any,
  ) {
    const tenantId = dto.tenantId || authUser?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.ordersService.createOrder(dto, authUser);
  }

  @Get()
  @ApiOperation({ summary: 'List orders for a tenant' })
  async getOrders(
    @Query('tenantId') queryTenantId?: string,
    @CurrentUser('tenantId') authTenantId?: string,
  ) {
    const resolvedTenantId = queryTenantId || authTenantId;
    if (!resolvedTenantId) {
      throw new BadRequestException('tenantId query parameter is required');
    }
    const data = await this.ordersService.getOrders(resolvedTenantId);
    return { success: true, count: data.length, data };
  }

  @Get('ledger')
  @ApiOperation({ summary: 'List stock ledger movement records for audit' })
  async getLedger(
    @Query('tenantId') queryTenantId?: string,
    @CurrentUser('tenantId') authTenantId?: string,
  ) {
    const resolvedTenantId = queryTenantId || authTenantId;
    if (!resolvedTenantId) {
      throw new BadRequestException('tenantId query parameter is required');
    }
    const data = await this.ordersService.getLedger(resolvedTenantId);
    return { success: true, count: data.length, data };
  }

  // ---- RETURNS & EXCHANGES ----
  @Post('returns')
  @ApiOperation({ summary: 'Process product return, stock restitution and refund' })
  async createReturn(@Body() dto: CreateReturnDto, @CurrentUser() authUser: any) {
    return this.orderReturnsService.createReturn(dto, authUser);
  }

  @Get('returns')
  @ApiOperation({ summary: 'List processed order returns' })
  async getReturns(
    @Query('tenantId') queryTenantId?: string,
    @CurrentUser('tenantId') authTenantId?: string,
  ) {
    const resolvedTenantId = queryTenantId || authTenantId;
    if (!resolvedTenantId) {
      throw new BadRequestException('tenantId query parameter is required');
    }
    const data = await this.orderReturnsService.getReturns(resolvedTenantId);
    return { success: true, count: data.length, data };
  }

  @Get('returns/invoice/:invoiceNumber')
  @ApiOperation({ summary: 'Find returns for a specific invoice' })
  async getReturnsByInvoice(
    @Param('invoiceNumber') invoiceNumber: string,
    @Query('tenantId') queryTenantId?: string,
    @CurrentUser('tenantId') authTenantId?: string,
  ) {
    const resolvedTenantId = queryTenantId || authTenantId;
    if (!resolvedTenantId) {
      throw new BadRequestException('tenantId query parameter is required');
    }
    const data = await this.orderReturnsService.getReturnsByInvoice(resolvedTenantId, invoiceNumber);
    return { success: true, data };
  }

  // ---- CASH DRAWER & SHIFT MANAGEMENT ----
  @Post('shifts/open')
  @ApiOperation({ summary: 'Open cashier drawer shift with float amount' })
  async openShift(@Body() dto: OpenShiftDto, @CurrentUser() authUser: any) {
    return this.cashDrawerService.openShift(dto, authUser);
  }

  @Get('shifts/current')
  @ApiOperation({ summary: 'Get active shift summary and live cash figures' })
  async getCurrentShift(
    @Query('tenantId') queryTenantId?: string,
    @CurrentUser('tenantId') authTenantId?: string,
  ): Promise<{ success: boolean; data: any }> {
    const resolvedTenantId = queryTenantId || authTenantId;
    if (!resolvedTenantId) {
      throw new BadRequestException('tenantId query parameter is required');
    }
    const data = await this.cashDrawerService.getCurrentShift(resolvedTenantId);
    return { success: true, data };
  }

  @Post('shifts/close')
  @ApiOperation({ summary: 'Close shift, input actual counted cash, and compute variance' })
  async closeShift(@Body() dto: CloseShiftDto, @CurrentUser() authUser: any) {
    return this.cashDrawerService.closeShift(dto, authUser);
  }

  @Get('shifts/history')
  @ApiOperation({ summary: 'List past closed cash drawer shifts' })
  async getShiftHistory(
    @Query('tenantId') queryTenantId?: string,
    @CurrentUser('tenantId') authTenantId?: string,
  ) {
    const resolvedTenantId = queryTenantId || authTenantId;
    if (!resolvedTenantId) {
      throw new BadRequestException('tenantId query parameter is required');
    }
    const data = await this.cashDrawerService.getShiftHistory(resolvedTenantId);
    return { success: true, count: data.length, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single order receipt details' })
  async getOrderById(
    @Param('id') id: string,
    @Query('tenantId') queryTenantId?: string,
    @CurrentUser('tenantId') authTenantId?: string,
  ) {
    const resolvedTenantId = queryTenantId || authTenantId;
    if (!resolvedTenantId) {
      throw new BadRequestException('tenantId query parameter is required');
    }
    const data = await this.ordersService.getOrderById(resolvedTenantId, id);
    return { success: true, data };
  }
}

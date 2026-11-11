import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('Orders & POS Checkout')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Finalize POS order and generate sequential invoice' })
  @ApiResponse({ status: 201, description: 'Order completed and stock deducted successfully' })
  async createOrder(@Body() dto: CreateOrderDto, @Req() req: any) {
    const authUser = req.user;
    const tenantId = dto.tenantId || authUser?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.ordersService.createOrder(dto, authUser);
  }

  @Get()
  @ApiOperation({ summary: 'List orders for a tenant' })
  async getOrders(@Query('tenantId') tenantId: string, @Req() req: any) {
    const resolvedTenantId = tenantId || req.user?.tenantId;
    if (!resolvedTenantId) {
      throw new BadRequestException('tenantId query parameter is required');
    }
    const data = await this.ordersService.getOrders(resolvedTenantId);
    return { success: true, count: data.length, data };
  }

  @Get('ledger')
  @ApiOperation({ summary: 'List stock ledger movement records for audit' })
  async getLedger(@Query('tenantId') tenantId: string, @Req() req: any) {
    const resolvedTenantId = tenantId || req.user?.tenantId;
    if (!resolvedTenantId) {
      throw new BadRequestException('tenantId query parameter is required');
    }
    const data = await this.ordersService.getLedger(resolvedTenantId);
    return { success: true, count: data.length, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single order receipt details' })
  async getOrderById(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
    @Req() req: any,
  ) {
    const resolvedTenantId = tenantId || req.user?.tenantId;
    if (!resolvedTenantId) {
      throw new BadRequestException('tenantId query parameter is required');
    }
    const data = await this.ordersService.getOrderById(resolvedTenantId, id);
    return { success: true, data };
  }
}


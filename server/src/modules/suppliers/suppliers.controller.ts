import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { PurchaseInwardService } from './purchase-inward.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { RecordSupplierPaymentDto } from './dto/record-payment.dto';
import { CurrentUser } from '../../common';

@ApiTags('Suppliers & Purchase Management')
@Controller('suppliers')
export class SuppliersController {
  constructor(
    private readonly suppliersService: SuppliersService,
    private readonly purchaseInwardService: PurchaseInwardService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Register a new supplier' })
  async createSupplier(
    @Body() dto: CreateSupplierDto,
    @CurrentUser('tenantId') authTenantId?: string,
  ) {
    const tenantId = dto.tenantId || authTenantId;
    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    const data = await this.suppliersService.createSupplier(tenantId, dto);
    return { success: true, data };
  }

  @Get()
  @ApiOperation({ summary: 'List all suppliers for tenant' })
  async getSuppliers(
    @Query('tenantId') queryTenantId?: string,
    @CurrentUser('tenantId') authTenantId?: string,
    @Query('search') search?: string,
  ) {
    const resolvedTenantId = queryTenantId || authTenantId;
    if (!resolvedTenantId) {
      throw new BadRequestException('tenantId query parameter is required');
    }
    const data = await this.suppliersService.getSuppliers(resolvedTenantId, search);
    return { success: true, count: data.length, data };
  }

  @Post('inward')
  @ApiOperation({ summary: 'Record Purchase Inward / GRN and increment inventory' })
  async createPurchaseInward(
    @Body() dto: CreatePurchaseDto,
    @CurrentUser() authUser?: any,
  ) {
    const tenantId = dto.tenantId || authUser?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    const outletId = dto.outletId || authUser?.outletIds?.[0];
    const data = await this.purchaseInwardService.createPurchaseInward(tenantId, dto, outletId);
    return { success: true, data };
  }

  @Get('inward/history')
  @ApiOperation({ summary: 'List inward shipments and GRNs' })
  async getPurchases(
    @Query('tenantId') queryTenantId?: string,
    @CurrentUser('tenantId') authTenantId?: string,
    @Query('supplierId') supplierId?: string,
  ) {
    const resolvedTenantId = queryTenantId || authTenantId;
    if (!resolvedTenantId) {
      throw new BadRequestException('tenantId query parameter is required');
    }
    const data = await this.purchaseInwardService.getPurchases(resolvedTenantId, supplierId);
    return { success: true, count: data.length, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single supplier details' })
  async getSupplierById(
    @Param('id') id: string,
    @Query('tenantId') queryTenantId?: string,
    @CurrentUser('tenantId') authTenantId?: string,
  ) {
    const resolvedTenantId = queryTenantId || authTenantId;
    if (!resolvedTenantId) {
      throw new BadRequestException('tenantId query parameter is required');
    }
    const data = await this.suppliersService.getSupplierById(resolvedTenantId, id);
    return { success: true, data };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update supplier profile' })
  async updateSupplier(
    @Param('id') id: string,
    @Body() dto: Partial<CreateSupplierDto>,
    @Query('tenantId') queryTenantId?: string,
    @CurrentUser('tenantId') authTenantId?: string,
  ) {
    const resolvedTenantId = dto.tenantId || queryTenantId || authTenantId;
    if (!resolvedTenantId) {
      throw new BadRequestException('tenantId is required');
    }
    const data = await this.suppliersService.updateSupplier(resolvedTenantId, id, dto);
    return { success: true, data };
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Record payment to supplier to settle balance' })
  async recordPayment(
    @Param('id') id: string,
    @Body() dto: RecordSupplierPaymentDto,
    @Query('tenantId') queryTenantId?: string,
    @CurrentUser('tenantId') authTenantId?: string,
  ) {
    const resolvedTenantId = queryTenantId || authTenantId;
    if (!resolvedTenantId) {
      throw new BadRequestException('tenantId is required');
    }
    const data = await this.suppliersService.recordSupplierPayment(resolvedTenantId, id, dto);
    return { success: true, data };
  }
}

import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { PurchaseInwardService } from './purchase-inward.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { RecordSupplierPaymentDto } from './dto/record-payment.dto';
import { PurchaseQueryDto, SupplierQueryDto } from './dto/supplier-query.dto';
import {
  AuthenticatedUser,
  CurrentUser,
  PaginationDto,
  ParseObjectIdPipe,
  ROLE_GROUPS,
  Roles,
  TenantId,
} from '../../common';

/** Procurement is back-office work: owner and store manager only. */
@ApiTags('Suppliers & Purchase Management')
@ApiBearerAuth()
@Roles(...ROLE_GROUPS.MANAGEMENT)
@Controller('suppliers')
export class SuppliersController {
  constructor(
    private readonly suppliersService: SuppliersService,
    private readonly purchaseInwardService: PurchaseInwardService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Register a new supplier' })
  async createSupplier(@TenantId() tenantId: string, @Body() dto: CreateSupplierDto) {
    return { message: 'Supplier created', data: await this.suppliersService.createSupplier(tenantId, dto) };
  }

  @Get()
  @ApiOperation({ summary: 'List suppliers (paginated, searchable)' })
  async getSuppliers(@TenantId() tenantId: string, @Query() query: SupplierQueryDto) {
    return this.suppliersService.getSuppliers(tenantId, query);
  }

  @Post('inward')
  @ApiOperation({ summary: 'Record Purchase Inward / GRN and increment inventory' })
  async createPurchaseInward(
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePurchaseDto,
  ) {
    const data = await this.purchaseInwardService.createPurchaseInward(tenantId, dto, user.outletIds?.[0]);
    return { message: `GRN ${data.grnNumber} recorded`, data };
  }

  @Get('inward/history')
  @ApiOperation({ summary: 'List inward shipments / GRNs (paginated)' })
  async getPurchases(@TenantId() tenantId: string, @Query() query: PurchaseQueryDto) {
    return this.purchaseInwardService.getPurchases(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single supplier details' })
  async getSupplierById(@TenantId() tenantId: string, @Param('id', ParseObjectIdPipe) id: string) {
    return { data: await this.suppliersService.getSupplierById(tenantId, id) };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update supplier profile' })
  async updateSupplier(
    @TenantId() tenantId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateSupplierDto,
  ) {
    return { message: 'Supplier updated', data: await this.suppliersService.updateSupplier(tenantId, id, dto) };
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Record payment to supplier to settle balance' })
  async recordPayment(
    @TenantId() tenantId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: RecordSupplierPaymentDto,
  ) {
    return { message: 'Payment recorded', data: await this.suppliersService.recordSupplierPayment(tenantId, id, dto) };
  }

  @Get(':id/payments')
  @ApiOperation({ summary: 'Payments made to a supplier (paginated)' })
  async getSupplierPayments(
    @TenantId() tenantId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Query() query: PaginationDto,
  ) {
    return this.suppliersService.getSupplierPayments(tenantId, id, query);
  }
}

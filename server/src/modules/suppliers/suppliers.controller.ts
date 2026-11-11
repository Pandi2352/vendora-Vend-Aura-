import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { PurchaseInwardService } from './purchase-inward.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { RecordSupplierPaymentDto } from './dto/record-payment.dto';
import { AuthenticatedUser, CurrentUser, TenantId } from '../../common';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

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
    @TenantId() tenantId: string,
  ) {
    const data = await this.suppliersService.createSupplier(tenantId, dto);
    return { success: true, data };
  }

  @Get()
  @ApiOperation({ summary: 'List all suppliers for tenant' })
  async getSuppliers(
    @TenantId() tenantId: string,
    @Query('search') search?: string,
  ) {
    const data = await this.suppliersService.getSuppliers(tenantId, search);
    return { success: true, count: data.length, data };
  }

  @Post('inward')
  @ApiOperation({ summary: 'Record Purchase Inward / GRN and increment inventory' })
  async createPurchaseInward(
    @Body() dto: CreatePurchaseDto,
    @TenantId() tenantId: string,
    @CurrentUser() authUser: AuthenticatedUser,
  ) {
    const outletId = authUser.outletIds?.[0];
    const data = await this.purchaseInwardService.createPurchaseInward(tenantId, dto, outletId);
    return { success: true, data };
  }

  @Get('inward/history')
  @ApiOperation({ summary: 'List inward shipments and GRNs' })
  async getPurchases(
    @TenantId() tenantId: string,
    @Query('supplierId') supplierId?: string,
  ) {
    const data = await this.purchaseInwardService.getPurchases(tenantId, supplierId);
    return { success: true, count: data.length, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single supplier details' })
  async getSupplierById(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    const data = await this.suppliersService.getSupplierById(tenantId, id);
    return { success: true, data };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update supplier profile' })
  async updateSupplier(
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
    @TenantId() tenantId: string,
  ) {
    const data = await this.suppliersService.updateSupplier(tenantId, id, dto);
    return { success: true, data };
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Record payment to supplier to settle balance' })
  async recordPayment(
    @Param('id') id: string,
    @Body() dto: RecordSupplierPaymentDto,
    @TenantId() tenantId: string,
  ) {
    const data = await this.suppliersService.recordSupplierPayment(tenantId, id, dto);
    return { success: true, data };
  }
}

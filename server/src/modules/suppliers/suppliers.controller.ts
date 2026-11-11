import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { RecordSupplierPaymentDto } from './dto/record-payment.dto';

@ApiTags('Suppliers & Purchase Management')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new supplier' })
  async createSupplier(@Body() dto: CreateSupplierDto, @Req() req: any) {
    const tenantId = dto.tenantId || req.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    const data = await this.suppliersService.createSupplier(tenantId, dto);
    return { success: true, data };
  }

  @Get()
  @ApiOperation({ summary: 'List all suppliers for tenant' })
  async getSuppliers(
    @Query('tenantId') tenantId: string,
    @Query('search') search: string,
    @Req() req: any,
  ) {
    const resolvedTenantId = tenantId || req.user?.tenantId;
    if (!resolvedTenantId) {
      throw new BadRequestException('tenantId query parameter is required');
    }
    const data = await this.suppliersService.getSuppliers(resolvedTenantId, search);
    return { success: true, count: data.length, data };
  }

  @Post('inward')
  @ApiOperation({ summary: 'Record Purchase Inward / GRN and increment inventory' })
  async createPurchaseInward(@Body() dto: CreatePurchaseDto, @Req() req: any) {
    const tenantId = dto.tenantId || req.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    const outletId = dto.outletId || req.user?.outletIds?.[0];
    const data = await this.suppliersService.createPurchaseInward(tenantId, dto, outletId);
    return { success: true, data };
  }

  @Get('inward/history')
  @ApiOperation({ summary: 'List inward shipments and GRNs' })
  async getPurchases(
    @Query('tenantId') tenantId: string,
    @Query('supplierId') supplierId: string,
    @Req() req: any,
  ) {
    const resolvedTenantId = tenantId || req.user?.tenantId;
    if (!resolvedTenantId) {
      throw new BadRequestException('tenantId query parameter is required');
    }
    const data = await this.suppliersService.getPurchases(resolvedTenantId, supplierId);
    return { success: true, count: data.length, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single supplier details' })
  async getSupplierById(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
    @Req() req: any,
  ) {
    const resolvedTenantId = tenantId || req.user?.tenantId;
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
    @Query('tenantId') tenantId: string,
    @Body() dto: Partial<CreateSupplierDto>,
    @Req() req: any,
  ) {
    const resolvedTenantId = dto.tenantId || tenantId || req.user?.tenantId;
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
    @Query('tenantId') tenantId: string,
    @Body() dto: RecordSupplierPaymentDto,
    @Req() req: any,
  ) {
    const resolvedTenantId = tenantId || req.user?.tenantId;
    if (!resolvedTenantId) {
      throw new BadRequestException('tenantId is required');
    }
    const data = await this.suppliersService.recordSupplierPayment(resolvedTenantId, id, dto);
    return { success: true, data };
  }
}

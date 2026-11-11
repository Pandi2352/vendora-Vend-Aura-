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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { RecordCustomerPaymentDto } from './dto/record-customer-payment.dto';

@ApiTags('Customers & Khata Ledger')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new customer profile' })
  async createCustomer(@Body() dto: CreateCustomerDto, @Req() req: any) {
    const tenantId = dto.tenantId || req.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    const data = await this.customersService.createCustomer(tenantId, dto);
    return { success: true, data };
  }

  @Get()
  @ApiOperation({ summary: 'Search and list customers for a tenant' })
  async getCustomers(
    @Query('tenantId') tenantId: string,
    @Query('search') search: string,
    @Req() req: any,
  ) {
    const resolvedTenantId = tenantId || req.user?.tenantId;
    if (!resolvedTenantId) {
      throw new BadRequestException('tenantId query parameter is required');
    }
    const data = await this.customersService.getCustomers(resolvedTenantId, search);
    return { success: true, count: data.length, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single customer profile' })
  async getCustomerById(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
    @Req() req: any,
  ) {
    const resolvedTenantId = tenantId || req.user?.tenantId;
    if (!resolvedTenantId) {
      throw new BadRequestException('tenantId query parameter is required');
    }
    const data = await this.customersService.getCustomerById(resolvedTenantId, id);
    return { success: true, data };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update customer profile' })
  async updateCustomer(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
    @Body() dto: Partial<CreateCustomerDto>,
    @Req() req: any,
  ) {
    const resolvedTenantId = dto.tenantId || tenantId || req.user?.tenantId;
    if (!resolvedTenantId) {
      throw new BadRequestException('tenantId is required');
    }
    const data = await this.customersService.updateCustomer(resolvedTenantId, id, dto);
    return { success: true, data };
  }

  @Post(':id/payment')
  @ApiOperation({ summary: 'Record Khata / Udhar repayment from customer' })
  async recordPayment(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
    @Body() dto: RecordCustomerPaymentDto,
    @Req() req: any,
  ) {
    const resolvedTenantId = tenantId || req.user?.tenantId;
    if (!resolvedTenantId) {
      throw new BadRequestException('tenantId is required');
    }
    const data = await this.customersService.recordPayment(resolvedTenantId, id, dto);
    return { success: true, data };
  }

  @Get(':id/statement')
  @ApiOperation({ summary: 'Get customer double-entry Khata statement ledger' })
  async getCustomerLedger(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
    @Req() req: any,
  ) {
    const resolvedTenantId = tenantId || req.user?.tenantId;
    if (!resolvedTenantId) {
      throw new BadRequestException('tenantId query parameter is required');
    }
    const data = await this.customersService.getCustomerLedger(resolvedTenantId, id);
    return { success: true, count: data.length, data };
  }
}

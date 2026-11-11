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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { RecordCustomerPaymentDto } from './dto/record-customer-payment.dto';
import { CurrentUser } from '../../common';

@ApiTags('Customers & Khata Ledger')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new customer profile' })
  async createCustomer(
    @Body() dto: CreateCustomerDto,
    @CurrentUser('tenantId') authTenantId?: string,
  ) {
    const tenantId = dto.tenantId || authTenantId;
    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    const data = await this.customersService.createCustomer(tenantId, dto);
    return { success: true, data };
  }

  @Get()
  @ApiOperation({ summary: 'Search and list customers for a tenant' })
  async getCustomers(
    @Query('tenantId') queryTenantId?: string,
    @CurrentUser('tenantId') authTenantId?: string,
    @Query('search') search?: string,
  ) {
    const resolvedTenantId = queryTenantId || authTenantId;
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
    @Query('tenantId') queryTenantId?: string,
    @CurrentUser('tenantId') authTenantId?: string,
  ) {
    const resolvedTenantId = queryTenantId || authTenantId;
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
    @Body() dto: Partial<CreateCustomerDto>,
    @Query('tenantId') queryTenantId?: string,
    @CurrentUser('tenantId') authTenantId?: string,
  ) {
    const resolvedTenantId = dto.tenantId || queryTenantId || authTenantId;
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
    @Body() dto: RecordCustomerPaymentDto,
    @Query('tenantId') queryTenantId?: string,
    @CurrentUser('tenantId') authTenantId?: string,
  ) {
    const resolvedTenantId = queryTenantId || authTenantId;
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
    @Query('tenantId') queryTenantId?: string,
    @CurrentUser('tenantId') authTenantId?: string,
  ) {
    const resolvedTenantId = queryTenantId || authTenantId;
    if (!resolvedTenantId) {
      throw new BadRequestException('tenantId query parameter is required');
    }
    const data = await this.customersService.getCustomerLedger(resolvedTenantId, id);
    return { success: true, count: data.length, data };
  }
}

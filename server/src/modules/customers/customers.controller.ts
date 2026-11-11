import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { RecordCustomerPaymentDto } from './dto/record-customer-payment.dto';
import { TenantId } from '../../common';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiTags('Customers & Khata Ledger')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new customer profile' })
  async createCustomer(
    @Body() dto: CreateCustomerDto,
    @TenantId() tenantId: string,
  ) {
    const data = await this.customersService.createCustomer(tenantId, dto);
    return { success: true, data };
  }

  @Get()
  @ApiOperation({ summary: 'Search and list customers for a tenant' })
  async getCustomers(
    @TenantId() tenantId: string,
    @Query('search') search?: string,
  ) {
    const data = await this.customersService.getCustomers(tenantId, search);
    return { success: true, count: data.length, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single customer profile' })
  async getCustomerById(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    const data = await this.customersService.getCustomerById(tenantId, id);
    return { success: true, data };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update customer profile' })
  async updateCustomer(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @TenantId() tenantId: string,
  ) {
    const data = await this.customersService.updateCustomer(tenantId, id, dto);
    return { success: true, data };
  }

  @Post(':id/payment')
  @ApiOperation({ summary: 'Record Khata / Udhar repayment from customer' })
  async recordPayment(
    @Param('id') id: string,
    @Body() dto: RecordCustomerPaymentDto,
    @TenantId() tenantId: string,
  ) {
    const data = await this.customersService.recordPayment(tenantId, id, dto);
    return { success: true, data };
  }

  @Get(':id/statement')
  @ApiOperation({ summary: 'Get customer double-entry Khata statement ledger' })
  async getCustomerLedger(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    const data = await this.customersService.getCustomerLedger(tenantId, id);
    return { success: true, count: data.length, data };
  }
}

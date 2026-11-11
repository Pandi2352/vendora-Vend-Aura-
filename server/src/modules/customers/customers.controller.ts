import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { RecordCustomerPaymentDto } from './dto/record-customer-payment.dto';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { PaginationDto, ParseObjectIdPipe, ROLE_GROUPS, Roles, TenantId } from '../../common';

@ApiTags('Customers & Khata Ledger')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new customer profile' })
  async createCustomer(@TenantId() tenantId: string, @Body() dto: CreateCustomerDto) {
    return { message: 'Customer created', data: await this.customersService.createCustomer(tenantId, dto) };
  }

  @Get()
  @ApiOperation({ summary: 'Search and list customers (paginated)' })
  async getCustomers(@TenantId() tenantId: string, @Query() query: CustomerQueryDto) {
    return this.customersService.getCustomers(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single customer profile' })
  async getCustomerById(@TenantId() tenantId: string, @Param('id', ParseObjectIdPipe) id: string) {
    return { data: await this.customersService.getCustomerById(tenantId, id) };
  }

  @Put(':id')
  @Roles(...ROLE_GROUPS.MANAGEMENT)
  @ApiOperation({ summary: 'Update customer profile (incl. credit limit) — owner / manager' })
  async updateCustomer(
    @TenantId() tenantId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return { message: 'Customer updated', data: await this.customersService.updateCustomer(tenantId, id, dto) };
  }

  @Post(':id/payment')
  @ApiOperation({ summary: 'Record Khata / Udhar repayment from customer' })
  async recordPayment(
    @TenantId() tenantId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: RecordCustomerPaymentDto,
  ) {
    return { message: 'Payment recorded', data: await this.customersService.recordPayment(tenantId, id, dto) };
  }

  @Get(':id/statement')
  @ApiOperation({ summary: 'Customer khata statement (paginated, newest first)' })
  async getCustomerLedger(
    @TenantId() tenantId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Query() query: PaginationDto,
  ) {
    return this.customersService.getCustomerLedger(tenantId, id, query);
  }
}

import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TenantId } from '../../common';
import { DiscountsService } from './discounts.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { ValidateDiscountDto } from './dto/validate-discount.dto';

@ApiTags('Merchandising & Discount Offers')
@ApiBearerAuth()
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Get()
  @ApiOperation({ summary: 'List all promotional discounts and coupon offers' })
  async listDiscounts(@TenantId() tenantId: string) {
    return { data: await this.discountsService.listDiscounts(tenantId) };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new promo code or discount offer' })
  async createDiscount(@TenantId() tenantId: string, @Body() dto: CreateDiscountDto) {
    return { message: 'Discount offer created', data: await this.discountsService.createDiscount(tenantId, dto) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing discount offer' })
  async updateDiscount(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDiscountDto,
  ) {
    return { message: 'Discount offer updated', data: await this.discountsService.updateDiscount(tenantId, id, dto) };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a discount offer' })
  async deleteDiscount(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.discountsService.deleteDiscount(tenantId, id);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate a coupon code at checkout and compute discount' })
  async validateCoupon(@TenantId() tenantId: string, @Body() dto: ValidateDiscountDto) {
    return { data: await this.discountsService.validateCoupon(tenantId, dto) };
  }
}

import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ example: '6731...', description: 'Product Mongo ID or Catalog ID' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 'Ponni Boiled Rice 5kg', description: 'Product Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '890103000001', description: 'Product Barcode' })
  @IsString()
  @IsNotEmpty()
  barcode: string;

  @ApiProperty({ example: 2, description: 'Quantity purchased' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 320, description: 'Unit selling price' })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ example: 5, description: 'GST rate percent' })
  @IsNumber()
  @IsOptional()
  taxRatePercent?: number;

  @ApiProperty({ example: 32, description: 'GST amount' })
  @IsNumber()
  @IsOptional()
  taxAmount?: number;

  @ApiProperty({ example: 672, description: 'Line total inclusive of tax' })
  @IsNumber()
  @Min(0)
  total: number;
}

export class CreateOrderDto {
  @ApiPropertyOptional({ description: 'Tenant ObjectId if calling directly' })
  @IsString()
  @IsOptional()
  tenantId?: string;

  @ApiPropertyOptional({ description: 'Outlet ObjectId' })
  @IsString()
  @IsOptional()
  outletId?: string;

  @ApiProperty({ type: [OrderItemDto], description: 'Items in cart' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ example: 640, description: 'Items subtotal before tax' })
  @IsNumber()
  @Min(0)
  subTotal: number;

  @ApiProperty({ example: 32, description: 'Total tax amount' })
  @IsNumber()
  @IsOptional()
  taxTotal?: number;

  @ApiProperty({ example: 16, description: 'CGST 50% split' })
  @IsNumber()
  @IsOptional()
  cgst?: number;

  @ApiProperty({ example: 16, description: 'SGST 50% split' })
  @IsNumber()
  @IsOptional()
  sgst?: number;

  @ApiProperty({ example: 672, description: 'Invoice grand total' })
  @IsNumber()
  @Min(0)
  grandTotal: number;

  @ApiProperty({ example: 'CASH', enum: ['CASH', 'UPI', 'CARD', 'CREDIT'] })
  @IsEnum(['CASH', 'UPI', 'CARD', 'CREDIT'])
  paymentMode: 'CASH' | 'UPI' | 'CARD' | 'CREDIT';

  @ApiPropertyOptional({ description: 'Customer ObjectId for Khata / CRM tracking' })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({ example: 'Arun Kumar', description: 'Customer Name' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ example: '9840123456', description: 'Customer Phone' })
  @IsString()
  @IsOptional()
  customerPhone?: string;

  @ApiPropertyOptional({ example: 1000, description: 'Cash tendered by customer' })
  @IsNumber()
  @IsOptional()
  cashTendered?: number;

  @ApiPropertyOptional({ example: 328, description: 'Change due back to customer' })
  @IsNumber()
  @IsOptional()
  changeDue?: number;

  @ApiPropertyOptional({ example: 'Pandi Selvam', description: 'Cashier operator name' })
  @IsString()
  @IsOptional()
  cashierName?: string;
}


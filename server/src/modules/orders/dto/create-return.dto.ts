import { IsNotEmpty, IsString, IsArray, ValidateNested, IsNumber, Min, IsOptional, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ReturnItemDto {
  @ApiProperty({ description: 'Product Mongo ID', example: '60d0fe4f5311236168a109ca' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Product name', example: 'Cotton Casual Shirt' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Barcode', example: '890103000001' })
  @IsNotEmpty()
  @IsString()
  barcode: string;

  @ApiProperty({ description: 'Quantity being returned', example: 1 })
  @IsNumber()
  @Min(1)
  quantityReturned: number;

  @ApiProperty({ description: 'Unit selling price', example: 799 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ description: 'GST rate percent', example: 5, required: false })
  @IsOptional()
  @IsNumber()
  taxRatePercent?: number;

  @ApiProperty({ description: 'Refund amount for this line', example: 799 })
  @IsNumber()
  @Min(0)
  refundAmount: number;

  @ApiProperty({
    description: 'Return reason',
    enum: ['DEFECTIVE', 'EXCHANGE', 'WRONG_ITEM', 'CUSTOMER_REQUEST'],
    example: 'CUSTOMER_REQUEST',
  })
  @IsIn(['DEFECTIVE', 'EXCHANGE', 'WRONG_ITEM', 'CUSTOMER_REQUEST'])
  reason: 'DEFECTIVE' | 'EXCHANGE' | 'WRONG_ITEM' | 'CUSTOMER_REQUEST';
}

export class CreateReturnDto {
  @ApiProperty({ description: 'Tenant Mongo ID', required: false })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiProperty({ description: 'Outlet Mongo ID', required: false })
  @IsOptional()
  @IsString()
  outletId?: string;

  @ApiProperty({ description: 'Original sales invoice number', example: 'INV-2026-00001' })
  @IsNotEmpty()
  @IsString()
  originalInvoiceNumber: string;

  @ApiProperty({ type: [ReturnItemDto], description: 'Items being returned' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnItemDto)
  items: ReturnItemDto[];

  @ApiProperty({ description: 'Total refund amount', example: 799 })
  @IsNumber()
  @Min(0)
  totalRefundAmount: number;

  @ApiProperty({
    description: 'Refund tender mode',
    enum: ['CASH', 'UPI', 'CREDIT_NOTE', 'CUSTOMER_KHATA'],
    default: 'CASH',
  })
  @IsIn(['CASH', 'UPI', 'CREDIT_NOTE', 'CUSTOMER_KHATA'])
  refundMode: 'CASH' | 'UPI' | 'CREDIT_NOTE' | 'CUSTOMER_KHATA';

  @ApiProperty({ description: 'Customer Mongo ID', required: false })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ description: 'Customer name', required: false })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiProperty({ description: 'Customer mobile phone', required: false })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiProperty({ description: 'Cashier name', required: false })
  @IsOptional()
  @IsString()
  cashierName?: string;

  @ApiProperty({ description: 'Return remarks / notes', required: false })
  @IsOptional()
  @IsString()
  remarks?: string;
}

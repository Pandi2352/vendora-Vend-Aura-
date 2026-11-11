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

export class ReturnItemDto {
  @ApiProperty({ description: 'Product ObjectId' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 'Ponni Boiled Rice 5kg' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '890103000001' })
  @IsString()
  @IsNotEmpty()
  barcode: string;

  @ApiProperty({ example: 1, description: 'Quantity returned' })
  @IsNumber()
  @Min(1)
  quantityReturned: number;

  @ApiProperty({ example: 320, description: 'Unit selling price on original invoice' })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ example: 5, description: 'GST rate percent' })
  @IsNumber()
  @IsOptional()
  taxRatePercent?: number;

  @ApiProperty({ example: 336, description: 'Refund amount for this line' })
  @IsNumber()
  @Min(0)
  refundAmount: number;

  @ApiProperty({ example: 'CUSTOMER_REQUEST', enum: ['DEFECTIVE', 'EXCHANGE', 'WRONG_ITEM', 'CUSTOMER_REQUEST'] })
  @IsEnum(['DEFECTIVE', 'EXCHANGE', 'WRONG_ITEM', 'CUSTOMER_REQUEST'])
  reason: 'DEFECTIVE' | 'EXCHANGE' | 'WRONG_ITEM' | 'CUSTOMER_REQUEST';
}

export class CreateOrderReturnDto {
  @ApiPropertyOptional({ description: 'Tenant ObjectId' })
  @IsString()
  @IsOptional()
  tenantId?: string;

  @ApiProperty({ example: 'INV-2026-00001', description: 'Original Invoice Number' })
  @IsString()
  @IsNotEmpty()
  originalInvoiceNumber: string;

  @ApiProperty({ type: [ReturnItemDto], description: 'Items being returned' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnItemDto)
  items: ReturnItemDto[];

  @ApiProperty({ example: 336, description: 'Total refund payout amount' })
  @IsNumber()
  @Min(0)
  totalRefundAmount: number;

  @ApiProperty({ example: 'CASH', enum: ['CASH', 'UPI', 'CREDIT_NOTE', 'CUSTOMER_KHATA'] })
  @IsEnum(['CASH', 'UPI', 'CREDIT_NOTE', 'CUSTOMER_KHATA'])
  refundMode: 'CASH' | 'UPI' | 'CREDIT_NOTE' | 'CUSTOMER_KHATA';

  @ApiPropertyOptional({ description: 'Customer ObjectId if Khata adjustment' })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({ example: 'Arun Kumar' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ example: '9840123456' })
  @IsString()
  @IsOptional()
  customerPhone?: string;

  @ApiPropertyOptional({ example: 'Customer exchanged for smaller size' })
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiPropertyOptional({ example: 'Cashier' })
  @IsString()
  @IsOptional()
  cashierName?: string;
}


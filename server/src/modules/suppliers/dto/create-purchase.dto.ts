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

export class PurchaseItemDto {
  @ApiProperty({ example: '6731...', description: 'Product MongoDB ObjectId' })
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

  @ApiProperty({ example: 25, description: 'Quantity inwarded' })
  @IsNumber()
  @Min(1)
  quantityReceived: number;

  @ApiProperty({ example: 280, description: 'Purchase cost per unit before tax' })
  @IsNumber()
  @Min(0)
  unitCostPrice: number;

  @ApiPropertyOptional({ example: 5, description: 'GST rate percent' })
  @IsNumber()
  @IsOptional()
  taxRatePercent?: number;

  @ApiPropertyOptional({ example: 350, description: 'GST tax total' })
  @IsNumber()
  @IsOptional()
  taxAmount?: number;

  @ApiProperty({ example: 7350, description: 'Line total inclusive of tax' })
  @IsNumber()
  @Min(0)
  total: number;
}

export class CreatePurchaseDto {
  @ApiPropertyOptional({ description: 'Tenant ObjectId' })
  @IsString()
  @IsOptional()
  tenantId?: string;

  @ApiPropertyOptional({ description: 'Outlet ObjectId' })
  @IsString()
  @IsOptional()
  outletId?: string;

  @ApiProperty({ description: 'Supplier ObjectId' })
  @IsString()
  @IsNotEmpty()
  supplierId: string;

  @ApiPropertyOptional({ example: 'INV/2026/894', description: 'Supplier physical invoice / bill number' })
  @IsString()
  @IsOptional()
  supplierInvoiceNumber?: string;

  @ApiProperty({ type: [PurchaseItemDto], description: 'Items inwarded in this shipment' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDto)
  items: PurchaseItemDto[];

  @ApiProperty({ example: 7000, description: 'Subtotal cost' })
  @IsNumber()
  @Min(0)
  subTotal: number;

  @ApiPropertyOptional({ example: 350, description: 'Tax amount' })
  @IsNumber()
  @IsOptional()
  taxTotal?: number;

  @ApiProperty({ example: 7350, description: 'Grand total bill amount' })
  @IsNumber()
  @Min(0)
  grandTotal: number;

  @ApiProperty({ example: 'UNPAID', enum: ['PAID', 'PARTIAL', 'UNPAID'] })
  @IsEnum(['PAID', 'PARTIAL', 'UNPAID'])
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID';

  @ApiPropertyOptional({ example: 2000, description: 'Amount paid immediately upon delivery' })
  @IsNumber()
  @IsOptional()
  amountPaid?: number;

  @ApiPropertyOptional({ example: 'Delivery batch #14 received in good condition' })
  @IsString()
  @IsOptional()
  notes?: string;
}


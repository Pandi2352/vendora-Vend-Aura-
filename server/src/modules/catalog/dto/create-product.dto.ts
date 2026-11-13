import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Product title / name', example: 'Aashirvaad Superior MP Atta 5kg' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Category name', example: 'Grocery' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ description: 'Barcode or EAN-13 code', example: '8901030382341' })
  @IsString()
  @IsNotEmpty()
  barcode: string;

  @ApiProperty({ description: 'Selling price charged at till (₹)', example: 285 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ description: 'Maximum Retail Price MRP (₹)', example: 310 })
  @IsNumber()
  @Min(0)
  mrp: number;

  @ApiPropertyOptional({ description: 'Landing / Purchase cost price (₹)', example: 240 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional({ description: 'GST rate percent (0, 5, 12, 18, 28)', example: 5, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(28)
  taxRatePercent?: number;

  @ApiPropertyOptional({ description: 'Current available stock quantity', example: 50, default: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ description: 'Unit of measure (pcs, kg, ltr, box, etc.)', example: 'pcs', default: 'pcs' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: 'Batch number for traceability', example: 'B-2026-04' })
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiPropertyOptional({ description: 'Product expiry date (YYYY-MM-DD)', example: '2026-12-31' })
  @IsOptional()
  @IsString()
  expiryDate?: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ description: 'Product title / name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Category name' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Barcode or EAN-13 code' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({ description: 'Selling price charged at till (₹)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum Retail Price MRP (₹)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  mrp?: number;

  @ApiPropertyOptional({ description: 'Landing / Purchase cost price (₹)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional({ description: 'GST rate percent' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(28)
  taxRatePercent?: number;

  @ApiPropertyOptional({ description: 'Current available stock quantity' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ description: 'Unit of measure' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: 'Batch number' })
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiPropertyOptional({ description: 'Product expiry date' })
  @IsOptional()
  @IsString()
  expiryDate?: string;
}


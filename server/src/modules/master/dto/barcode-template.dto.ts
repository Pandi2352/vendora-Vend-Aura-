import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateBarcodeTemplateDto {
  @ApiProperty({ description: 'Template code', example: 'LBL-50X25' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Template display name', example: 'Standard Shelf 50x25mm' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Label paper width in millimeters', example: 50 })
  @IsNumber()
  @Min(10)
  paperWidthMm: number;

  @ApiProperty({ description: 'Label paper height in millimeters', example: 25 })
  @IsNumber()
  @Min(10)
  paperHeightMm: number;

  @ApiPropertyOptional({ description: 'Number of sticker columns across page', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  columns?: number;

  @ApiPropertyOptional({ description: 'Target printer type', enum: ['thermal', 'laser', 'inkjet'], default: 'thermal' })
  @IsOptional()
  @IsIn(['thermal', 'laser', 'inkjet'])
  printerType?: string;

  @ApiPropertyOptional({ description: 'Print retail selling price', default: true })
  @IsOptional()
  @IsBoolean()
  showPrice?: boolean;

  @ApiPropertyOptional({ description: 'Print product barcode image', default: true })
  @IsOptional()
  @IsBoolean()
  showBarcode?: boolean;

  @ApiPropertyOptional({ description: 'Print shop header branding', default: true })
  @IsOptional()
  @IsBoolean()
  showStoreName?: boolean;

  @ApiPropertyOptional({ description: 'Active status', default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateBarcodeTemplateDto {
  @ApiPropertyOptional({ description: 'Template code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Template display name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Label paper width in millimeters' })
  @IsOptional()
  @IsNumber()
  @Min(10)
  paperWidthMm?: number;

  @ApiPropertyOptional({ description: 'Label paper height in millimeters' })
  @IsOptional()
  @IsNumber()
  @Min(10)
  paperHeightMm?: number;

  @ApiPropertyOptional({ description: 'Number of sticker columns across page' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  columns?: number;

  @ApiPropertyOptional({ description: 'Target printer type', enum: ['thermal', 'laser', 'inkjet'] })
  @IsOptional()
  @IsIn(['thermal', 'laser', 'inkjet'])
  printerType?: string;

  @ApiPropertyOptional({ description: 'Print retail selling price' })
  @IsOptional()
  @IsBoolean()
  showPrice?: boolean;

  @ApiPropertyOptional({ description: 'Print product barcode image' })
  @IsOptional()
  @IsBoolean()
  showBarcode?: boolean;

  @ApiPropertyOptional({ description: 'Print shop header branding' })
  @IsOptional()
  @IsBoolean()
  showStoreName?: boolean;

  @ApiPropertyOptional({ description: 'Active status' })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}


import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category display name', example: 'Beverages' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Category slug identifier', example: 'beverages' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Icon name', example: 'coffee' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: 'Sort display order', example: 1, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ description: 'Category display name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Category slug identifier' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Icon name' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: 'Sort display order' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;
}

export class UpdateOpeningStockDto {
  @ApiProperty({ description: 'Product MongoDB ID or barcode' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'New opening stock quantity' })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({ description: 'Landing cost price (₹)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;
}


import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';

export class TransferItemDto {
  @ApiProperty({ description: 'Product MongoDB ID' })
  @IsMongoId()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Product Name' })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({ description: 'Product Barcode' })
  @IsString()
  @IsNotEmpty()
  barcode: string;

  @ApiProperty({ description: 'Quantity to transfer', example: 10 })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiPropertyOptional({ description: 'Unit of measure', example: 'pcs' })
  @IsOptional()
  @IsString()
  unit?: string;
}

export class CreateStockTransferDto {
  @ApiProperty({ description: 'Source Outlet ID' })
  @IsMongoId()
  @IsNotEmpty()
  sourceOutletId: string;

  @ApiProperty({ description: 'Destination Outlet ID' })
  @IsMongoId()
  @IsNotEmpty()
  destinationOutletId: string;

  @ApiProperty({ type: [TransferItemDto], description: 'Items to transfer' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TransferItemDto)
  items: TransferItemDto[];

  @ApiPropertyOptional({ description: 'Transfer dispatch notes / driver name' })
  @IsOptional()
  @IsString()
  notes?: string;
}


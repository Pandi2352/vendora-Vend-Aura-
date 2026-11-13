import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common';

export class CreateWastageDto {
  @ApiProperty({ example: '665f1c...' })
  @IsMongoId()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 5, description: 'Number of units spoiled or damaged' })
  @IsNumber()
  @Min(0.001)
  quantity: number;

  @ApiProperty({
    enum: [
      'EXPIRED',
      'DAMAGED_IN_TRANSIT',
      'CUSTOMER_RETURN_DEFECTIVE',
      'THEFT_SHRINKAGE',
      'HANDLING_SPOILAGE',
      'OTHER',
    ],
    example: 'EXPIRED',
  })
  @IsEnum([
    'EXPIRED',
    'DAMAGED_IN_TRANSIT',
    'CUSTOMER_RETURN_DEFECTIVE',
    'THEFT_SHRINKAGE',
    'HANDLING_SPOILAGE',
    'OTHER',
  ])
  reason:
    | 'EXPIRED'
    | 'DAMAGED_IN_TRANSIT'
    | 'CUSTOMER_RETURN_DEFECTIVE'
    | 'THEFT_SHRINKAGE'
    | 'HANDLING_SPOILAGE'
    | 'OTHER';

  @ApiPropertyOptional({ example: 'Expired milk cartons from dairy rack' })
  @IsString()
  @IsOptional()
  remarks?: string;
}

export class PhysicalAuditCountLineDto {
  @ApiProperty({ example: '665f1c...' })
  @IsMongoId()
  productId: string;

  @ApiProperty({ example: 48, description: 'Physical quantity counted in store' })
  @IsNumber()
  @Min(0)
  physicalCount: number;
}

export class ReconcileAuditDto {
  @ApiProperty({ type: [PhysicalAuditCountLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PhysicalAuditCountLineDto)
  items: PhysicalAuditCountLineDto[];

  @ApiPropertyOptional({ example: 'Monthly physical inventory audit' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class StockLedgerQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'OUTWARD_SALE' })
  @IsString()
  @IsOptional()
  movementType?: string;

  @ApiPropertyOptional({ example: '665f1c...' })
  @IsMongoId()
  @IsOptional()
  productId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  endDate?: string;
}


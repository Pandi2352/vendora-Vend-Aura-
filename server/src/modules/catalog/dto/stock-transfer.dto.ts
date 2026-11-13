import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateTransferItemDto {
  @ApiProperty({ example: '665f1c...d1' })
  @IsMongoId()
  productId: string;

  @ApiProperty({ example: 10, minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateStockTransferDto {
  @ApiProperty({ example: '665f1c...o1', description: 'Source outlet ID' })
  @IsMongoId()
  sourceOutletId: string;

  @ApiProperty({ example: '665f1c...o2', description: 'Destination outlet ID' })
  @IsMongoId()
  destinationOutletId: string;

  @ApiProperty({ type: [CreateTransferItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateTransferItemDto)
  items: CreateTransferItemDto[];

  @ApiPropertyOptional({ example: 'Urgent restocking for weekend festival' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class StockTransferQueryDto {
  @ApiPropertyOptional({ enum: ['ALL', 'PENDING', 'DISPATCHED', 'RECEIVED', 'CANCELLED'] })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}


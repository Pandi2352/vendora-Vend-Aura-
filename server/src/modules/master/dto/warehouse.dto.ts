import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateWarehouseDto {
  @ApiProperty({ description: 'Warehouse unique code', example: 'WH01' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Warehouse name', example: 'Central Godown' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional() @IsOptional() @IsString() address1?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address2?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address3?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pincode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fax?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  handlingPercent?: number;

  @ApiPropertyOptional({ enum: ['net-cost', 'landing-cost', 'mrp'] })
  @IsOptional()
  @IsString()
  handlingBasis?: string | null;

  @ApiPropertyOptional({ enum: ['add', 'deduct'] })
  @IsOptional()
  @IsString()
  handlingType?: string | null;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateWarehouseDto {
  @ApiPropertyOptional() @IsOptional() @IsString() code?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address1?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address2?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address3?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pincode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fax?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(100) handlingPercent?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() handlingBasis?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() handlingType?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() active?: boolean;
}

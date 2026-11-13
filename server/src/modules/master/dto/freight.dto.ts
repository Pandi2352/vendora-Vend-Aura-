import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateFreightDto {
  @ApiProperty({ description: 'Freight rule unique code', example: 'FRT-LOCAL' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Freight rule display name', example: 'Standard Local Delivery' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Rate calculation type', enum: ['flat', 'per-kg', 'percentage'], default: 'flat' })
  @IsIn(['flat', 'per-kg', 'percentage'])
  rateType: string;

  @ApiProperty({ description: 'Charge amount or percentage', example: 120 })
  @IsNumber()
  @Min(0)
  rate: number;

  @ApiPropertyOptional({ description: 'Minimum base charge', example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({ description: 'Applicability scope', enum: ['all', 'sales', 'purchase', 'transfer'], default: 'all' })
  @IsOptional()
  @IsIn(['all', 'sales', 'purchase', 'transfer'])
  applicableOn?: string;

  @ApiPropertyOptional({ description: 'Active status', default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateFreightDto {
  @ApiPropertyOptional({ description: 'Freight rule unique code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Freight rule display name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Rate calculation type', enum: ['flat', 'per-kg', 'percentage'] })
  @IsOptional()
  @IsIn(['flat', 'per-kg', 'percentage'])
  rateType?: string;

  @ApiPropertyOptional({ description: 'Charge amount or percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rate?: number;

  @ApiPropertyOptional({ description: 'Minimum base charge' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({ description: 'Applicability scope', enum: ['all', 'sales', 'purchase', 'transfer'] })
  @IsOptional()
  @IsIn(['all', 'sales', 'purchase', 'transfer'])
  applicableOn?: string;

  @ApiPropertyOptional({ description: 'Active status' })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePickerDto {
  @ApiProperty({ description: 'Picker badge code', example: 'PKR-01' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Staff picker full name', example: 'Karthik Sundaram' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Staff phone number', example: '+91 98401 54321' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Assigned aisle or warehouse zone', example: 'Grocery Aisle 1-4' })
  @IsOptional()
  @IsString()
  assignedZone?: string;

  @ApiPropertyOptional({ description: 'Active status', default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdatePickerDto {
  @ApiPropertyOptional({ description: 'Picker badge code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Staff picker full name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Staff phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Assigned aisle or warehouse zone' })
  @IsOptional()
  @IsString()
  assignedZone?: string;

  @ApiPropertyOptional({ description: 'Active status' })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}


import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTransporterDto {
  @ApiProperty({ description: 'Unique transporter code', example: 'TR-BLUEDART' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Transporter legal or trade name', example: 'Blue Dart Express' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'GST Transporter ID / E-way bill ID', example: '29AABCU9603R1ZM' })
  @IsOptional()
  @IsString()
  transporterId?: string;

  @ApiPropertyOptional({ description: 'Contact phone number', example: '+91 98401 23456' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Vehicle registration number', example: 'TN 01 AB 1234' })
  @IsOptional()
  @IsString()
  vehicleNumber?: string;

  @ApiPropertyOptional({ description: 'Depot or contact address', example: 'Industrial Estate, Guindy' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Active status', default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateTransporterDto {
  @ApiPropertyOptional({ description: 'Unique transporter code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Transporter legal or trade name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'GST Transporter ID / E-way bill ID' })
  @IsOptional()
  @IsString()
  transporterId?: string;

  @ApiPropertyOptional({ description: 'Contact phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Vehicle registration number' })
  @IsOptional()
  @IsString()
  vehicleNumber?: string;

  @ApiPropertyOptional({ description: 'Depot or contact address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Active status' })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}


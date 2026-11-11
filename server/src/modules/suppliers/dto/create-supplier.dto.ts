import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddressDto, IsGstin, IsIndianMobile } from '../../../common';

export class CreateSupplierDto {
  @ApiProperty({ example: 'Sri Meenakshi Traders', description: 'Supplier / Distributor Trading Name' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Murugan K', description: 'Representative / Contact Person Name' })
  @IsString()
  @MaxLength(120)
  @IsOptional()
  contactPerson?: string;

  @ApiProperty({ example: '9840122334', description: 'Phone / WhatsApp Number' })
  @IsIndianMobile()
  phone: string;

  @ApiPropertyOptional({ example: 'orders@meenakshitraders.in', description: 'Email Address' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '33AAAAA1234A1Z5', description: 'GSTIN Registration Number' })
  @IsGstin()
  @IsOptional()
  gstin?: string;

  @ApiPropertyOptional({ example: 30, description: 'Payment credit terms in days' })
  @IsInt()
  @Min(0)
  @Max(365)
  @IsOptional()
  creditDays?: number;

  @ApiPropertyOptional({ example: 'FMCG & Groceries' })
  @IsString()
  @MaxLength(80)
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}

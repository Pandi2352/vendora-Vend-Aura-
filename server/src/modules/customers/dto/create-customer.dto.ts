import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Min, MinLength, ValidateNested, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddressDto, IsGstin, IsIndianMobile } from '../../../common';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Arun Kumar', description: 'Customer full name' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '9840123456', description: 'Mobile / WhatsApp number' })
  @IsIndianMobile()
  phone: string;

  @ApiPropertyOptional({ example: 'arun@gmail.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '33AAAAA1234A1Z5', description: 'GSTIN for B2B Retail billing' })
  @IsGstin()
  @IsOptional()
  gstin?: string;

  @ApiPropertyOptional({ example: 5000, description: 'Maximum credit allowed (Udhar limit in ₹)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  creditLimit?: number;

  @ApiPropertyOptional({ type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiPropertyOptional({ example: 'Regular neighbourhood customer' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  notes?: string;
}

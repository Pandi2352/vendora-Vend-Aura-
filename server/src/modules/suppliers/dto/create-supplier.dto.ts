import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierDto {

  @ApiProperty({ example: 'Sri Meenakshi Traders', description: 'Supplier / Distributor Trading Name' })
  @IsString()
  @MinLength(2)
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Murugan K', description: 'Representative / Contact Person Name' })
  @IsString()
  @IsOptional()
  contactPerson?: string;

  @ApiProperty({ example: '+919840122334', description: 'Phone / WhatsApp Number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ example: 'orders@meenakshitraders.in', description: 'Email Address' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '33AAAAA1234A1Z5', description: 'GSTIN Registration Number' })
  @IsString()
  @IsOptional()
  gstin?: string;

  @ApiPropertyOptional({ example: 30, description: 'Payment credit terms in days' })
  @IsNumber()
  @IsOptional()
  creditDays?: number;

  @ApiPropertyOptional({ example: 'FMCG & Groceries' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    example: { street: '14 Wholesale Market Road', city: 'Madurai', state: 'Tamil Nadu', pincode: '625001' },
  })
  @IsOptional()
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}


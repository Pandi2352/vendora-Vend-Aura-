import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiPropertyOptional({ description: 'Tenant ObjectId' })
  @IsString()
  @IsOptional()
  tenantId?: string;

  @ApiProperty({ example: 'Arun Kumar', description: 'Customer full name' })
  @IsString()
  @MinLength(2)
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '9840123456', description: 'Mobile / WhatsApp number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ example: 'arun@gmail.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '33AAAAA1234A1Z5', description: 'GSTIN for B2B Retail billing' })
  @IsString()
  @IsOptional()
  gstin?: string;

  @ApiPropertyOptional({ example: 5000, description: 'Maximum credit allowed (Udhar limit in ₹)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  creditLimit?: number;

  @ApiPropertyOptional({
    example: { street: '15 Anna Salai', city: 'Chennai', state: 'Tamil Nadu', pincode: '600002' },
  })
  @IsOptional()
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };

  @ApiPropertyOptional({ example: 'Regular neighbourhood customer' })
  @IsString()
  @IsOptional()
  notes?: string;
}


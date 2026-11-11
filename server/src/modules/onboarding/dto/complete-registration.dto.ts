import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BusinessType, SubscriptionPlanCode } from '../../../shared';

export class AddressDto {
  @ApiProperty({ example: '12 Bazaar Road' })
  @IsString()
  @IsOptional()
  street?: string;

  @ApiProperty({ example: 'Chennai' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Tamil Nadu' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ example: '600001' })
  @IsString()
  @IsOptional()
  pincode?: string;

  @ApiPropertyOptional({ example: 'India' })
  @IsString()
  @IsOptional()
  country?: string = 'India';
}

export class CompleteRegistrationDto {
  @ApiProperty({ example: 'sess_12345abc', description: 'Verified registration session ID' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({ example: 'Sri Murugan Stores', description: 'Store trading name' })
  @IsString()
  @MinLength(2)
  @IsNotEmpty()
  businessName: string;

  @ApiProperty({ example: 'Pandi Selvam', description: 'Proprietor / Owner full name' })
  @IsString()
  @MinLength(2)
  @IsNotEmpty()
  ownerName: string;

  @ApiProperty({ example: '+919876543210', description: 'Contact phone / WhatsApp number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: BusinessType.GROCERY,
    enum: BusinessType,
    description: 'Specific retail category',
  })
  @IsEnum(BusinessType)
  @IsNotEmpty()
  businessType: BusinessType;

  @ApiProperty({
    example: 'srimurugan',
    description: 'Unique store identifier / subdomain prefix',
  })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Shop ID can only contain lowercase letters, numbers, and hyphens (e.g., myshop)',
  })
  @MinLength(3)
  @IsNotEmpty()
  preferredShopId: string;

  @ApiProperty({ type: AddressDto, description: 'Store physical address' })
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiPropertyOptional({ example: '33AAAAA0000A1Z5', description: '15-digit GSTIN (optional)' })
  @IsString()
  @IsOptional()
  gstin?: string;

  @ApiPropertyOptional({ enum: SubscriptionPlanCode, description: 'Overrides the plan chosen at OTP time' })
  @IsEnum(SubscriptionPlanCode)
  @IsOptional()
  selectedPlanCode?: SubscriptionPlanCode;
}


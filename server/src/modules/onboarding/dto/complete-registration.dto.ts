import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BusinessType, SubscriptionPlanCode } from '../../../shared';
import { AddressDto, IsGstin, IsIndianMobile } from '../../../common';

/** Store address at registration: city is required, the rest optional. */
export class RegistrationAddressDto extends AddressDto {
  @ApiProperty({ example: 'Chennai' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  declare city: string;
}

export class CompleteRegistrationDto {
  @ApiProperty({ example: 'reg_12345abc', description: 'Verified registration session ID' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({ example: 'Sri Murugan Stores', description: 'Store trading name' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  businessName: string;

  @ApiProperty({ example: 'Pandi Selvam', description: 'Proprietor / Owner full name' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  ownerName: string;

  @ApiProperty({ example: '9876543210', description: 'Contact phone / WhatsApp number' })
  @IsIndianMobile()
  phone: string;

  @ApiProperty({ example: BusinessType.GROCERY, enum: BusinessType, description: 'Specific retail category' })
  @IsEnum(BusinessType)
  businessType: BusinessType;

  @ApiProperty({ example: 'murugn', description: 'Unique store identifier: 3-6 lowercase letters or digits' })
  @IsString()
  @Matches(/^[a-z0-9]{3,6}$/, { message: 'Shop ID must be 3-6 lowercase letters or numbers (e.g., myshop)' })
  preferredShopId: string;

  @ApiProperty({ type: RegistrationAddressDto, description: 'Store physical address' })
  @ValidateNested()
  @Type(() => RegistrationAddressDto)
  address: RegistrationAddressDto;

  @ApiPropertyOptional({ example: '33AAAAA0000A1Z5', description: '15-character GSTIN (optional)' })
  @IsGstin()
  @IsOptional()
  gstin?: string;

  @ApiPropertyOptional({ enum: SubscriptionPlanCode, description: 'Overrides the plan chosen at OTP time' })
  @IsEnum(SubscriptionPlanCode)
  @IsOptional()
  selectedPlanCode?: SubscriptionPlanCode;
}

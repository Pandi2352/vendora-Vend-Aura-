import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateDiscountDto {
  @ApiProperty({ example: 'DIWALI20', description: 'Unique coupon promo code' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(30)
  code: string;

  @ApiProperty({ example: 'Diwali Festive Discount', description: 'Offer title' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ enum: ['PERCENTAGE', 'FLAT', 'BUY_X_GET_Y', 'HAPPY_HOUR'], example: 'PERCENTAGE' })
  @IsEnum(['PERCENTAGE', 'FLAT', 'BUY_X_GET_Y', 'HAPPY_HOUR'])
  type: 'PERCENTAGE' | 'FLAT' | 'BUY_X_GET_Y' | 'HAPPY_HOUR';

  @ApiProperty({ example: 20, description: 'Discount value (percentage or flat ₹)' })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({ example: 500, description: 'Minimum order cart value in ₹' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minOrderValue?: number;

  @ApiPropertyOptional({ example: 200, description: 'Maximum discount cap in ₹' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxDiscountCap?: number;

  @ApiPropertyOptional({ example: '2026-10-01' })
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-11-30' })
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: '14:00', description: 'Start time for happy hour (HH:mm)' })
  @IsString()
  @IsOptional()
  happyHourStart?: string;

  @ApiPropertyOptional({ example: '17:00', description: 'End time for happy hour (HH:mm)' })
  @IsString()
  @IsOptional()
  happyHourEnd?: string;

  @ApiPropertyOptional({ example: 100, description: 'Maximum total redemptions' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  usageLimit?: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

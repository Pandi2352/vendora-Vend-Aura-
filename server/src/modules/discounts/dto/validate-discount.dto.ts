import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ValidateDiscountDto {
  @ApiProperty({ example: 'DIWALI20', description: 'Promo coupon code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 1250, description: 'Current subtotal / order value in ₹' })
  @IsNumber()
  @Min(0)
  orderAmount: number;

  @ApiPropertyOptional({ example: '15:30', description: 'Client local time (HH:mm) for happy hours' })
  @IsString()
  @IsOptional()
  currentTime?: string;
}

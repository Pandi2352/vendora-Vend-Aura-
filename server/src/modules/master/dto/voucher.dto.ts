import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateVoucherDto {
  @ApiProperty({ description: 'Voucher series code', example: 'GV-FESTIVE500' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Voucher title / campaign name', example: 'Diwali Festive Gift Voucher' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Value type', enum: ['flat', 'percentage'], default: 'flat' })
  @IsIn(['flat', 'percentage'])
  voucherType: string;

  @ApiProperty({ description: 'Value in Rupees or percent', example: 500 })
  @IsNumber()
  @Min(1)
  value: number;

  @ApiPropertyOptional({ description: 'Minimum bill total required', example: 2000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minBillAmount?: number;

  @ApiPropertyOptional({ description: 'Validity period in days', default: 90 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  validityDays?: number;

  @ApiPropertyOptional({ description: 'Active status', default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateVoucherDto {
  @ApiPropertyOptional({ description: 'Voucher series code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Voucher title / campaign name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Value type', enum: ['flat', 'percentage'] })
  @IsOptional()
  @IsIn(['flat', 'percentage'])
  voucherType?: string;

  @ApiPropertyOptional({ description: 'Value in Rupees or percent' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  value?: number;

  @ApiPropertyOptional({ description: 'Minimum bill total required' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minBillAmount?: number;

  @ApiPropertyOptional({ description: 'Validity period in days' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  validityDays?: number;

  @ApiPropertyOptional({ description: 'Active status' })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

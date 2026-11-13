import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateReasonDto {
  @ApiProperty({ description: 'Reason code', example: 'DMG-01', maxLength: 15 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  code: string;

  @ApiProperty({ description: 'Reason description', example: 'Product packaging damaged in transit' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  description: string;

  @ApiPropertyOptional({ maxLength: 60 })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  reasonFor?: string;

  @ApiProperty({
    description: 'Transaction type',
    enum: ['sales-return', 'purchase-return', 'stock-adjustment', 'stock-transfer', 'damage', 'discount'],
  })
  @IsString()
  @IsNotEmpty()
  transactionType: string;

  @ApiProperty({ description: 'Effect on stock/balance', enum: ['addition', 'deduction'] })
  @IsString()
  @IsNotEmpty()
  effect: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateReasonDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(15) code?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(60) reasonFor?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() transactionType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() effect?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() active?: boolean;
}

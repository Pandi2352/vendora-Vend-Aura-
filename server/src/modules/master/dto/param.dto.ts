import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateParamDto {
  @ApiProperty({ description: 'Parameter key', example: 'BILL_COPIES', maxLength: 30 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  code: string;

  @ApiProperty({ description: 'Description', example: 'Number of copies printed per invoice bill' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  description: string;

  @ApiProperty({
    description: 'Module',
    enum: ['billing', 'inventory', 'purchase', 'accounts', 'general'],
  })
  @IsString()
  @IsNotEmpty()
  module: string;

  @ApiProperty({
    description: 'Value type',
    enum: ['text', 'number', 'yesno'],
  })
  @IsString()
  @IsNotEmpty()
  valueType: string;

  @ApiProperty({ description: 'Value', example: '2', maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  value: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateParamDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(30) code?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() module?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() valueType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) value?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() active?: boolean;
}

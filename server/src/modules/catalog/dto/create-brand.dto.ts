import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ example: 'Tata Consumer' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  @ApiPropertyOptional({ example: 'TATA' })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  code?: string;

  @ApiPropertyOptional({ example: 'FMCG and packaged foods' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}

export class UpdateBrandDto extends PartialType(CreateBrandDto) {}


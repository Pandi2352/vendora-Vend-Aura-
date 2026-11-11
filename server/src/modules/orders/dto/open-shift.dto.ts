import { IsNumber, Min, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OpenShiftDto {
  @ApiProperty({ description: 'Opening cash float in drawer (₹)', example: 2000, default: 0 })
  @IsNumber()
  @Min(0)
  openingFloat: number;

  @ApiProperty({ description: 'Optional opening notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

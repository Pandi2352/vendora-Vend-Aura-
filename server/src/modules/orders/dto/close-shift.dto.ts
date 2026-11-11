import { IsMongoId, IsNumber, Min, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CloseShiftDto {
  @ApiProperty({ description: 'Open shift ID' })
  @IsMongoId()
  shiftId: string;

  @ApiProperty({ description: 'Physically counted cash in drawer (₹)', example: 5400 })
  @IsNumber()
  @Min(0)
  actualCashCounted: number;

  @ApiProperty({ description: 'Optional closing notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

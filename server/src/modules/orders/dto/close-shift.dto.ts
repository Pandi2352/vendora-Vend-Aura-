import { IsNotEmpty, IsNumber, Min, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CloseShiftDto {
  @ApiProperty({ description: 'Tenant Mongo ID', required: false })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiProperty({ description: 'Shift Mongo ID', example: '60d0fe4f5311236168a109ca' })
  @IsNotEmpty()
  @IsString()
  shiftId: string;

  @ApiProperty({ description: 'Actual physical cash counted in drawer (₹)', example: 14500 })
  @IsNumber()
  @Min(0)
  actualCashCounted: number;

  @ApiProperty({ description: 'Closing notes or variance reason', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

import { IsNotEmpty, IsNumber, Min, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OpenShiftDto {
  @ApiProperty({ description: 'Tenant Mongo ID', required: false })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiProperty({ description: 'Outlet Mongo ID', required: false })
  @IsOptional()
  @IsString()
  outletId?: string;

  @ApiProperty({ description: 'Cashier name', example: 'Priya' })
  @IsNotEmpty()
  @IsString()
  cashierName: string;

  @ApiProperty({ description: 'Opening cash float in drawer (₹)', example: 2000, default: 0 })
  @IsNumber()
  @Min(0)
  openingFloat: number;

  @ApiProperty({ description: 'Optional opening notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

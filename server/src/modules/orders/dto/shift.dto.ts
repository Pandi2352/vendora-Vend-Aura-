import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OpenShiftDto {
  @ApiPropertyOptional({ description: 'Tenant ObjectId' })
  @IsString()
  @IsOptional()
  tenantId?: string;

  @ApiPropertyOptional({ description: 'Outlet ObjectId' })
  @IsString()
  @IsOptional()
  outletId?: string;

  @ApiProperty({ example: 2000, description: 'Opening cash float placed in drawer at morning' })
  @IsNumber()
  @Min(0)
  openingFloat: number;

  @ApiPropertyOptional({ example: 'Pandi Selvam' })
  @IsString()
  @IsOptional()
  cashierName?: string;
}

export class CloseShiftDto {
  @ApiPropertyOptional({ description: 'Tenant ObjectId' })
  @IsString()
  @IsOptional()
  tenantId?: string;

  @ApiProperty({ example: 8450, description: 'Physical cash counted inside drawer at day end' })
  @IsNumber()
  @Min(0)
  actualCashCounted: number;

  @ApiPropertyOptional({ example: 'Shift ended smoothly. ₹50 variance due to small change' })
  @IsString()
  @IsOptional()
  notes?: string;
}


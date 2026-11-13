import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOutletDto {
  @ApiProperty({ description: 'Outlet or Branch name', example: 'Anna Nagar Branch' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Outlet unique identifier code', example: 'OUT-02' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ description: 'Branch phone number', example: '+91 9876543210' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Branch contact email', example: 'branch2@myshop.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Person in charge' })
  @IsOptional()
  @IsString()
  incharge?: string;

  @ApiPropertyOptional({ description: 'Sort code' })
  @IsOptional()
  @IsString()
  sortCode?: string;

  @ApiPropertyOptional({ description: 'Address line 2' })
  @IsOptional()
  @IsString()
  address2?: string;

  @ApiPropertyOptional({ description: 'Address line 3' })
  @IsOptional()
  @IsString()
  address3?: string;

  @ApiPropertyOptional({ description: 'GSTIN' })
  @IsOptional()
  @IsString()
  gstin?: string;

  @ApiPropertyOptional({ description: 'State code' })
  @IsOptional()
  @IsString()
  stateCode?: string;

  @ApiPropertyOptional({ description: 'Fax number' })
  @IsOptional()
  @IsString()
  fax?: string;

  @ApiPropertyOptional({ description: 'Whether this location is a warehouse' })
  @IsOptional()
  @IsBoolean()
  isWarehouse?: boolean;

  @ApiPropertyOptional({ description: 'Warehouse ID this location draws from' })
  @IsOptional()
  @IsString()
  warehouseId?: string | null;

  @ApiPropertyOptional({ description: 'Active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Physical address object' })
  @IsOptional()
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}


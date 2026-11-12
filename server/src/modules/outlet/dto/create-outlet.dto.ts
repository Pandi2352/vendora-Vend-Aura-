import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

  @ApiPropertyOptional({ description: 'Physical address object' })
  @IsOptional()
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}


import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../../shared';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Rajesh Kumar' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  fullName?: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ enum: [UserRole.STORE_MANAGER, UserRole.CASHIER, UserRole.ACCOUNTANT] })
  @IsEnum([UserRole.STORE_MANAGER, UserRole.CASHIER, UserRole.ACCOUNTANT])
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  outletIds?: string[];

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ResetUserPasswordDto {
  @ApiPropertyOptional({ example: 'NewPass123!', description: 'New temporary password' })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  newPassword: string;
}


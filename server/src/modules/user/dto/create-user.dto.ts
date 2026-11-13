import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../../shared';

export class CreateUserDto {
  @ApiProperty({ example: 'cashier_raj', description: 'Unique username for store login' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-z0-9_]+$/, { message: 'Username must contain only lowercase letters, numbers, and underscores' })
  username: string;

  @ApiProperty({ example: 'Rajesh Kumar', description: 'Full legal name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @ApiProperty({ example: 'rajesh@store.com', description: 'Work email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: '9876543210', description: 'Mobile phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ enum: [UserRole.STORE_MANAGER, UserRole.CASHIER, UserRole.ACCOUNTANT], example: UserRole.CASHIER })
  @IsEnum([UserRole.STORE_MANAGER, UserRole.CASHIER, UserRole.ACCOUNTANT], {
    message: 'Role must be STORE_MANAGER, CASHIER, or ACCOUNTANT',
  })
  role: UserRole;

  @ApiProperty({ example: 'TempPass123!', description: 'Initial temporary password' })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  password: string;

  @ApiPropertyOptional({ type: [String], description: 'Assigned outlet IDs' })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  outletIds?: string[];
}


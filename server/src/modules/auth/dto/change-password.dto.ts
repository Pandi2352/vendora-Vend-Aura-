import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'TempPass@123', description: 'Current or temporary password' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'PermanentSecurePassword@2026', description: 'New permanent password' })
  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @IsNotEmpty()
  newPassword: string;
}


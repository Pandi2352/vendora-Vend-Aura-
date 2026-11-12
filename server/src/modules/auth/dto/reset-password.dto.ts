import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'One-time reset token from the emailed link' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  token: string;

  @ApiProperty({ example: 'NewSecurePass2026', description: 'New password: at least 8 characters with a letter and a number' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @MaxLength(128)
  @Matches(/[A-Za-z]/, { message: 'New password must contain at least one letter' })
  @Matches(/\d/, { message: 'New password must contain at least one number' })
  newPassword: string;
}

import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({ example: 'sess_12345abc', description: 'Registration session identifier' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({ example: '849201', description: '6-digit numeric verification OTP' })
  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @IsNotEmpty()
  otp: string;
}


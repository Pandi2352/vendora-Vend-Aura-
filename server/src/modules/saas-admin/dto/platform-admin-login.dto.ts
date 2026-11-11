import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PlatformAdminLoginDto {
  @ApiProperty({ example: 'admin@vendora.com', description: 'Platform Admin Username or Email configured in .env' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'Vendora@Admin2026!', description: 'Platform Admin Password configured in .env' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;
}


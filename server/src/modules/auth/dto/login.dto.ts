import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'srimurugan', description: 'Store identifier / subdomain' })
  @IsString()
  @IsNotEmpty()
  shopId: string;

  @ApiProperty({ example: 'srimurugan_admin', description: 'Username or email' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'Vnf7abd2!', description: 'Account password' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;
}


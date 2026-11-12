import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'srimurugan', description: 'Store identifier (Shop ID)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  shopId: string;

  @ApiProperty({ example: 'srimurugan_admin', description: 'Username or email of the store user' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(254)
  identifier: string;
}

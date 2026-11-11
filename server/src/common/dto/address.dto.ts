import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsPincode } from '../validators/business-validators';

/** Reusable postal address. Use with @ValidateNested() @Type(() => AddressDto). */
export class AddressDto {
  @ApiPropertyOptional({ example: '15 Anna Salai' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  street?: string;

  @ApiPropertyOptional({ example: 'Chennai' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'Tamil Nadu' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({ example: '600002' })
  @IsOptional()
  @IsPincode()
  pincode?: string;

  @ApiPropertyOptional({ example: 'India', default: 'India' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  country?: string;
}

import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BusinessType, TenantStatus } from '../../../shared';

/** 'ALL' (or empty) means no filter. */
const allToUndefined = Transform(({ value }) => (value === 'ALL' || value === '' ? undefined : value));

export class TenantQueryDto {
  @ApiPropertyOptional({ description: 'Search shop ID, name, owner, email or phone' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ enum: TenantStatus })
  @allToUndefined
  @IsOptional()
  @IsEnum(TenantStatus)
  status?: TenantStatus;

  @ApiPropertyOptional({ enum: BusinessType })
  @allToUndefined
  @IsOptional()
  @IsEnum(BusinessType)
  sector?: BusinessType;
}

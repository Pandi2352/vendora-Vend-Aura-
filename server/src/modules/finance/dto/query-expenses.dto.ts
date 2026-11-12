import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common';

export class QueryExpensesDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by Outlet ID' })
  @IsOptional()
  @IsMongoId()
  outletId?: string;

  @ApiPropertyOptional({ description: 'Filter by category (RENT, UTILITIES, etc.)' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter from start date (ISO YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filter up to end date (ISO YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  endDate?: string;
}


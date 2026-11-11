import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DateRangeDto {
  @ApiPropertyOptional({ description: 'Start date in ISO format', example: '2026-11-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date in ISO format', example: '2026-11-30T23:59:59.999Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}


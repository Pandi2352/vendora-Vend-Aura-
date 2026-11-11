import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReportsQueryDto {
  @ApiPropertyOptional({ description: 'Tenant Mongo ID' })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiPropertyOptional({
    description: 'Time period preset',
    enum: ['today', 'week', 'month', 'fy', 'all'],
    default: 'today',
  })
  @IsOptional()
  @IsIn(['today', 'week', 'month', 'fy', 'all'])
  period?: 'today' | 'week' | 'month' | 'fy' | 'all';

  @ApiPropertyOptional({ description: 'Custom Start Date (ISO string)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Custom End Date (ISO string)' })
  @IsOptional()
  @IsString()
  endDate?: string;
}

import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CatalogQueryDto {
  @ApiPropertyOptional({ description: 'Search by name, barcode or category' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ description: "Category name, or 'ALL'" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;
}

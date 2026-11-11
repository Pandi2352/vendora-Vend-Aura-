import { IsMongoId, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto, SearchQueryDto } from '../../../common';

/** GET /suppliers: page, limit (max 100), search by name / phone / contact / GSTIN / category. */
export class SupplierQueryDto extends SearchQueryDto {}

/** GET /suppliers/inward/history */
export class PurchaseQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Only GRNs from this supplier' })
  @IsOptional()
  @IsMongoId()
  supplierId?: string;
}

import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CatalogQueryDto } from './dto/catalog-query.dto';
import { CatalogService } from './catalog.service';
import { TenantId } from '../../common';

@ApiTags('Multi-Tenant Catalog & Products')
@ApiBearerAuth()
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('products')
  @ApiOperation({ summary: 'Get products for a store tenant with search & category filters' })
  @ApiResponse({ status: 200, description: 'List of tenant products returned' })
  async getProducts(@TenantId() tenantId: string, @Query() query: CatalogQueryDto) {
    return { data: await this.catalogService.getProductsByTenant(tenantId, query) };
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get categories for a store tenant' })
  @ApiResponse({ status: 200, description: 'List of tenant categories returned' })
  async getCategories(@TenantId() tenantId: string) {
    return { data: await this.catalogService.getCategoriesByTenant(tenantId) };
  }
}

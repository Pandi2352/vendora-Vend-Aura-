import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { TenantId } from '../../common';

@ApiTags('Multi-Tenant Catalog & Products')
@ApiBearerAuth()
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('products')
  @ApiOperation({ summary: 'Get products for a store tenant with search & category filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiResponse({ status: 200, description: 'List of tenant products returned' })
  async getProducts(
    @TenantId() tenantId: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    const products = await this.catalogService.getProductsByTenant(tenantId, { search, category });
    return {
      success: true,
      data: products,
    };
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get categories for a store tenant' })
  @ApiResponse({ status: 200, description: 'List of tenant categories returned' })
  async getCategories(
    @TenantId() tenantId: string,
  ) {
    const categories = await this.catalogService.getCategoriesByTenant(tenantId);
    return {
      success: true,
      data: categories,
    };
  }
}

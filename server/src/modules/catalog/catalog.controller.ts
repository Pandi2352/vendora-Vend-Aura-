import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { Public, CurrentUser } from '../../common';

@ApiTags('Multi-Tenant Catalog & Products')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Public()
  @Get('products')
  @ApiOperation({ summary: 'Get products for a store tenant with search & category filters' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Tenant store ObjectId' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiResponse({ status: 200, description: 'List of tenant products returned' })
  async getProducts(
    @Query('tenantId') queryTenantId?: string,
    @CurrentUser('tenantId') authTenantId?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    const tenantId = queryTenantId || authTenantId;
    if (!tenantId) {
      return { success: true, data: [] };
    }
    const products = await this.catalogService.getProductsByTenant(tenantId, { search, category });
    return {
      success: true,
      data: products,
    };
  }

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Get categories for a store tenant' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Tenant store ObjectId' })
  @ApiResponse({ status: 200, description: 'List of tenant categories returned' })
  async getCategories(
    @Query('tenantId') queryTenantId?: string,
    @CurrentUser('tenantId') authTenantId?: string,
  ) {
    const tenantId = queryTenantId || authTenantId;
    if (!tenantId) {
      return { success: true, data: [] };
    }
    const categories = await this.catalogService.getCategoriesByTenant(tenantId);
    return {
      success: true,
      data: categories,
    };
  }
}

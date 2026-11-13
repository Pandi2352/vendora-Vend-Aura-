import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CatalogQueryDto } from './dto/catalog-query.dto';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { CreateCategoryDto, UpdateCategoryDto, UpdateOpeningStockDto } from './dto/create-category.dto';
import { CreateBrandDto, UpdateBrandDto } from './dto/create-brand.dto';
import { CatalogService } from './catalog.service';
import { TenantId } from '../../common';

@ApiTags('Multi-Tenant Catalog & Products')
@ApiBearerAuth()
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // --- Products ---
  @Get('products')
  @ApiOperation({ summary: 'Get products for a store tenant with search & category filters' })
  @ApiResponse({ status: 200, description: 'List of tenant products returned' })
  async getProducts(@TenantId() tenantId: string, @Query() query: CatalogQueryDto) {
    return { data: await this.catalogService.getProductsByTenant(tenantId, query) };
  }

  @Post('products')
  @ApiOperation({ summary: 'Create a new product in store catalog' })
  async createProduct(@TenantId() tenantId: string, @Body() dto: CreateProductDto) {
    return { message: 'Product created', data: await this.catalogService.createProduct(tenantId, dto) };
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'Update an existing product' })
  async updateProduct(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return { message: 'Product updated', data: await this.catalogService.updateProduct(tenantId, id, dto) };
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Delete a product' })
  async deleteProduct(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.catalogService.deleteProduct(tenantId, id);
  }

  // --- Categories ---
  @Get('categories')
  @ApiOperation({ summary: 'Get categories for a store tenant' })
  @ApiResponse({ status: 200, description: 'List of tenant categories returned' })
  async getCategories(@TenantId() tenantId: string) {
    return { data: await this.catalogService.getCategoriesByTenant(tenantId) };
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create a new product category' })
  async createCategory(@TenantId() tenantId: string, @Body() dto: CreateCategoryDto) {
    return { message: 'Category created', data: await this.catalogService.createCategory(tenantId, dto) };
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update a product category' })
  async updateCategory(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return { message: 'Category updated', data: await this.catalogService.updateCategory(tenantId, id, dto) };
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete a product category' })
  async deleteCategory(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.catalogService.deleteCategory(tenantId, id);
  }

  // --- Opening Stock ---
  @Post('opening-stock')
  @ApiOperation({ summary: 'Update product opening stock and cost price' })
  async updateOpeningStock(@TenantId() tenantId: string, @Body() dto: UpdateOpeningStockDto) {
    return { message: 'Opening stock updated', data: await this.catalogService.updateOpeningStock(tenantId, dto) };
  }

  // --- Brands ---
  @Get('brands')
  @ApiOperation({ summary: 'Get brands for a store tenant' })
  @ApiResponse({ status: 200, description: 'List of tenant brands returned' })
  async getBrands(@TenantId() tenantId: string) {
    return { data: await this.catalogService.getBrandsByTenant(tenantId) };
  }

  @Post('brands')
  @ApiOperation({ summary: 'Create a new brand' })
  async createBrand(@TenantId() tenantId: string, @Body() dto: CreateBrandDto) {
    return { message: 'Brand created', data: await this.catalogService.createBrand(tenantId, dto) };
  }

  @Patch('brands/:id')
  @ApiOperation({ summary: 'Update a brand' })
  async updateBrand(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBrandDto,
  ) {
    return { message: 'Brand updated', data: await this.catalogService.updateBrand(tenantId, id, dto) };
  }

  @Delete('brands/:id')
  @ApiOperation({ summary: 'Delete a brand' })
  async deleteBrand(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.catalogService.deleteBrand(tenantId, id);
  }
}

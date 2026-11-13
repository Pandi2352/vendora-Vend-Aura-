import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { NumberUtil, ObjectIdUtil, StringUtil, withId } from '../../common';
import { CatalogQueryDto } from './dto/catalog-query.dto';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { CreateCategoryDto, UpdateCategoryDto, UpdateOpeningStockDto } from './dto/create-category.dto';
import { CreateBrandDto, UpdateBrandDto } from './dto/create-brand.dto';
import { Product, ProductDocument } from './schemas/product.schema';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Brand, BrandDocument } from './schemas/brand.schema';
import { BusinessType } from '../../shared';
import { getStarterCatalogData } from './starter-catalog.data';

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Brand.name) private readonly brandModel: Model<BrandDocument>,
  ) {}

  /** Get all products for a specific tenant with optional category/search filters */
  async getProductsByTenant(tenantId: string, query: CatalogQueryDto) {
    const filter: FilterQuery<ProductDocument> = {
      tenantId: ObjectIdUtil.toObjectId(tenantId, 'tenant'),
      isActive: true,
      isDeleted: { $ne: true },
    };

    if (query.category && query.category !== 'ALL') {
      filter.category = query.category;
    }
    const regex = StringUtil.searchRegex(query.search);
    if (regex) {
      filter.$or = [{ name: regex }, { barcode: regex }, { category: regex }];
    }

    const products = await this.productModel.find(filter).sort({ name: 1 }).lean();
    return products.map(withId);
  }

  /** Get categories for a tenant */
  async getCategoriesByTenant(tenantId: string) {
    const categories = await this.categoryModel
      .find({
        tenantId: ObjectIdUtil.toObjectId(tenantId, 'tenant'),
        isActive: true,
        isDeleted: { $ne: true },
      })
      .sort({ displayOrder: 1 })
      .lean();
    return categories.map(withId);
  }

  /** Create a new product in the tenant catalog */
  async createProduct(tenantIdStr: string, dto: CreateProductDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const barcode = dto.barcode.trim();

    const exists = await this.productModel.findOne({ tenantId, barcode, isDeleted: { $ne: true } }).lean();
    if (exists) {
      throw new ConflictException(`A product with barcode "${barcode}" already exists.`);
    }

    const costPrice = dto.costPrice ?? NumberUtil.round(dto.unitPrice * 0.75);
    const prod = await this.productModel.create({
      ...dto,
      tenantId,
      barcode,
      name: dto.name.trim(),
      category: dto.category.trim(),
      costPrice,
      taxRatePercent: dto.taxRatePercent ?? 0,
      stock: dto.stock ?? 50,
      unit: dto.unit || 'pcs',
      isActive: true,
    });
    return withId(prod.toObject());
  }

  /** Update an existing product */
  async updateProduct(tenantIdStr: string, idStr: string, dto: UpdateProductDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'product');

    if (dto.barcode) {
      const barcode = dto.barcode.trim();
      const duplicate = await this.productModel.findOne({
        tenantId,
        barcode,
        _id: { $ne: id },
        isDeleted: { $ne: true },
      }).lean();
      if (duplicate) {
        throw new ConflictException(`A product with barcode "${barcode}" already exists.`);
      }
    }

    const payload: Record<string, unknown> = { ...dto };
    if (dto.name) payload.name = dto.name.trim();
    if (dto.category) payload.category = dto.category.trim();
    if (dto.barcode) payload.barcode = dto.barcode.trim();

    const updated = await this.productModel.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: payload },
      { new: true },
    ).lean();

    if (!updated) throw new NotFoundException('Product not found.');
    return withId(updated);
  }

  /** Soft-delete a product */
  async deleteProduct(tenantIdStr: string, idStr: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'product');

    const deleted = await this.productModel.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: { isActive: false, isDeleted: true } },
      { new: true },
    );
    if (!deleted) throw new NotFoundException('Product not found.');
    return { success: true };
  }

  /** Create a new category */
  async createCategory(tenantIdStr: string, dto: CreateCategoryDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const name = dto.name.trim();
    const slug = dto.slug?.trim() || StringUtil.slugify(name);

    const exists = await this.categoryModel.findOne({ tenantId, slug, isDeleted: { $ne: true } }).lean();
    if (exists) {
      throw new ConflictException(`Category "${name}" already exists.`);
    }

    const cat = await this.categoryModel.create({
      tenantId,
      name,
      slug,
      icon: dto.icon || 'Tag',
      displayOrder: dto.displayOrder ?? 0,
      isActive: true,
    });
    return withId(cat.toObject());
  }

  /** Update a category */
  async updateCategory(tenantIdStr: string, idStr: string, dto: UpdateCategoryDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'category');

    const payload: Record<string, unknown> = { ...dto };
    if (dto.name) {
      payload.name = dto.name.trim();
      if (!dto.slug) payload.slug = StringUtil.slugify(dto.name);
    }

    const updated = await this.categoryModel.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: payload },
      { new: true },
    ).lean();

    if (!updated) throw new NotFoundException('Category not found.');
    return withId(updated);
  }

  /** Delete a category */
  async deleteCategory(tenantIdStr: string, idStr: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'category');

    const deleted = await this.categoryModel.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: { isActive: false, isDeleted: true } },
      { new: true },
    );
    if (!deleted) throw new NotFoundException('Category not found.');
    return { success: true };
  }

  /** Update opening stock and cost valuation */
  async updateOpeningStock(tenantIdStr: string, dto: UpdateOpeningStockDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const filter = ObjectIdUtil.isValid(dto.productId)
      ? { _id: ObjectIdUtil.toObjectId(dto.productId, 'product'), tenantId }
      : { barcode: dto.productId, tenantId };

    const update: Record<string, unknown> = { stock: dto.stock };
    if (dto.costPrice !== undefined) update.costPrice = dto.costPrice;

    const prod = await this.productModel.findOneAndUpdate(filter, { $set: update }, { new: true }).lean();
    if (!prod) throw new NotFoundException('Product not found.');
    return withId(prod);
  }

  /** Seed sector-specific starter catalog on tenant registration */
  async seedTenantCatalog(tenantId: Types.ObjectId | string, businessType: BusinessType) {
    const tId = ObjectIdUtil.toObjectId(tenantId, 'tenant');
    const existing = await this.productModel.countDocuments({ tenantId: tId });
    if (existing > 0) return;

    const { categories, products } = getStarterCatalogData(businessType);

    for (let i = 0; i < categories.length; i++) {
      const catName = categories[i];
      await this.categoryModel.create({
        tenantId: tId,
        name: catName,
        slug: StringUtil.slugify(catName),
        displayOrder: i + 1,
        isActive: true,
      });
    }

    for (const prod of products) {
      await this.productModel.create({
        tenantId: tId,
        name: prod.name,
        category: prod.category,
        barcode: prod.barcode,
        unitPrice: prod.unitPrice,
        mrp: prod.mrp,
        costPrice: NumberUtil.round(prod.unitPrice * 0.75),
        taxRatePercent: prod.taxRatePercent,
        stock: prod.stock || 50,
        unit: prod.unit || 'pcs',
        isActive: true,
      });
    }

    this.logger.log(`✓ Seeded ${products.length} starter products for Tenant [${tenantId}] (${businessType})`);
  }

  /** Get all brands for a tenant */
  async getBrandsByTenant(tenantId: string) {
    const brands = await this.brandModel
      .find({
        tenantId: ObjectIdUtil.toObjectId(tenantId, 'tenant'),
        isActive: true,
        isDeleted: { $ne: true },
      })
      .sort({ displayOrder: 1, name: 1 })
      .lean();
    return brands.map(withId);
  }

  /** Create a brand */
  async createBrand(tenantIdStr: string, dto: CreateBrandDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const name = dto.name.trim();

    const exists = await this.brandModel.findOne({ tenantId, name, isDeleted: { $ne: true } }).lean();
    if (exists) {
      throw new ConflictException(`A brand named "${name}" already exists.`);
    }

    const brand = await this.brandModel.create({
      tenantId,
      name,
      code: dto.code?.trim().toUpperCase(),
      description: dto.description?.trim(),
      displayOrder: dto.displayOrder ?? 0,
      isActive: true,
    });
    return withId(brand.toObject());
  }

  /** Update an existing brand */
  async updateBrand(tenantIdStr: string, idStr: string, dto: UpdateBrandDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'brand');

    if (dto.name) {
      const name = dto.name.trim();
      const duplicate = await this.brandModel.findOne({
        tenantId,
        name,
        _id: { $ne: id },
        isDeleted: { $ne: true },
      }).lean();
      if (duplicate) {
        throw new ConflictException(`A brand named "${name}" already exists.`);
      }
    }

    const payload: Record<string, unknown> = { ...dto };
    if (dto.name) payload.name = dto.name.trim();
    if (dto.code) payload.code = dto.code.trim().toUpperCase();
    if (dto.description !== undefined) payload.description = dto.description?.trim();

    const brand = await this.brandModel.findOneAndUpdate(
      { _id: id, tenantId, isDeleted: { $ne: true } },
      { $set: payload },
      { new: true },
    ).lean();
    if (!brand) throw new NotFoundException('Brand not found.');
    return withId(brand);
  }

  /** Delete a brand */
  async deleteBrand(tenantIdStr: string, idStr: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'brand');

    const brand = await this.brandModel.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: { isDeleted: true, isActive: false } },
      { new: true },
    ).lean();
    if (!brand) throw new NotFoundException('Brand not found.');
    return { message: 'Brand deleted successfully' };
  }
}

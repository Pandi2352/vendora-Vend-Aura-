import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { Category, CategoryDocument } from './schemas/category.schema';
import { BusinessType } from '../../shared';

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  /**
   * Get all products for a specific tenant with optional category/search filters
   */
  async getProductsByTenant(tenantId: string, query?: { search?: string; category?: string }) {
    const filter: any = { tenantId: new Types.ObjectId(tenantId), isActive: true };

    if (query?.category && query.category !== 'ALL') {
      filter.category = query.category;
    }

    if (query?.search) {
      const regex = new RegExp(query.search.trim(), 'i');
      filter.$or = [{ name: regex }, { barcode: regex }, { category: regex }];
    }

    return this.productModel.find(filter).sort({ name: 1 }).lean();
  }

  /**
   * Get categories for a tenant
   */
  async getCategoriesByTenant(tenantId: string) {
    return this.categoryModel
      .find({ tenantId: new Types.ObjectId(tenantId), isActive: true })
      .sort({ displayOrder: 1 })
      .lean();
  }

  /**
   * Seed sector-specific starter catalog on tenant registration
   */
  async seedTenantCatalog(tenantId: Types.ObjectId | string, businessType: BusinessType) {
    const tId = new Types.ObjectId(tenantId);

    // Verify if already seeded
    const existing = await this.productModel.countDocuments({ tenantId: tId });
    if (existing > 0) {
      return;
    }

    const { categories, products } = this.getStarterCatalogData(businessType);

    // Seed Categories
    for (let i = 0; i < categories.length; i++) {
      const catName = categories[i];
      await this.categoryModel.create({
        tenantId: tId,
        name: catName,
        slug: catName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        displayOrder: i + 1,
        isActive: true,
      });
    }

    // Seed Products
    for (const prod of products) {
      await this.productModel.create({
        tenantId: tId,
        name: prod.name,
        category: prod.category,
        barcode: prod.barcode,
        unitPrice: prod.unitPrice,
        mrp: prod.mrp,
        costPrice: Math.round(prod.unitPrice * 0.75),
        taxRatePercent: prod.taxRatePercent,
        stock: prod.stock || 50,
        unit: prod.unit || 'pcs',
        isActive: true,
      });
    }

    this.logger.log(`✓ Seeded ${products.length} starter products for Tenant [${tenantId}] (${businessType})`);
  }

  private getStarterCatalogData(businessType: BusinessType): {
    categories: string[];
    products: Array<{
      name: string;
      category: string;
      barcode: string;
      unitPrice: number;
      mrp: number;
      taxRatePercent: number;
      stock?: number;
      unit?: string;
    }>;
  } {
    switch (businessType) {
      case BusinessType.TEXTILE_GARMENTS:
        return {
          categories: ['Men', 'Women', 'Kids', 'Ethnic', 'Fabrics'],
          products: [
            { name: "Men's Formal Oxford Cotton Shirt - Sky Blue", category: 'Men', barcode: '8902001', unitPrice: 899, mrp: 1299, taxRatePercent: 5 },
            { name: 'Slim Fit Stretch Denim Jeans 32"', category: 'Men', barcode: '8902002', unitPrice: 1299, mrp: 1799, taxRatePercent: 12 },
            { name: 'Kanchipuram Silk Saree Traditional Zari', category: 'Ethnic', barcode: '8902003', unitPrice: 3499, mrp: 4999, taxRatePercent: 5 },
            { name: 'Printed Rayon Anarkali Kurti Set', category: 'Women', barcode: '8902004', unitPrice: 999, mrp: 1499, taxRatePercent: 5 },
            { name: "Kids Pure Cotton Graphic T-Shirt", category: 'Kids', barcode: '8902005', unitPrice: 349, mrp: 499, taxRatePercent: 5 },
            { name: "Men's Classic Linen Trousers - Beige", category: 'Men', barcode: '8902006', unitPrice: 1199, mrp: 1599, taxRatePercent: 12 },
            { name: 'Chanderi Silk Dupatta Floral Embroidery', category: 'Ethnic', barcode: '8902007', unitPrice: 499, mrp: 799, taxRatePercent: 5 },
            { name: 'Pure Cotton Handloom Towel Set (Pack of 2)', category: 'Fabrics', barcode: '8902008', unitPrice: 299, mrp: 399, taxRatePercent: 5 },
          ],
        };

      case BusinessType.PHARMACY:
        return {
          categories: ['Medicines', 'Vitamins & Health', 'First Aid', 'Personal Care', 'Baby Care'],
          products: [
            { name: 'Dolo 650mg Paracetamol Tablets (Strip of 15)', category: 'Medicines', barcode: '8903001', unitPrice: 32, mrp: 34, taxRatePercent: 12 },
            { name: 'Limcee 500mg Vitamin C Chewable (Strip of 15)', category: 'Vitamins & Health', barcode: '8903002', unitPrice: 26, mrp: 28, taxRatePercent: 12 },
            { name: 'Dettol Antiseptic Liquid 250ml Bottle', category: 'First Aid', barcode: '8903003', unitPrice: 145, mrp: 150, taxRatePercent: 18 },
            { name: 'Band-Aid Washproof Strips (Pack of 20)', category: 'First Aid', barcode: '8903004', unitPrice: 50, mrp: 55, taxRatePercent: 12 },
            { name: 'Electral ORS Hydration Powder 21.8g Sachet', category: 'Medicines', barcode: '8903005', unitPrice: 22, mrp: 24, taxRatePercent: 5 },
            { name: 'Himalaya Baby Wet Wipes 72s', category: 'Baby Care', barcode: '8903006', unitPrice: 165, mrp: 190, taxRatePercent: 18 },
            { name: 'Moov Pain Relief Ointment 50g Tube', category: 'Medicines', barcode: '8903007', unitPrice: 175, mrp: 185, taxRatePercent: 12 },
            { name: 'Digital Infrared Forehead Thermometer', category: 'Personal Care', barcode: '8903008', unitPrice: 850, mrp: 1200, taxRatePercent: 18 },
          ],
        };

      case BusinessType.BAKERY_SWEETS:
        return {
          categories: ['Breads & Buns', 'Cakes & Pastries', 'Cookies & Biscuits', 'Traditional Sweets', 'Savouries'],
          products: [
            { name: 'Fresh Milk Bread 400g Loaf', category: 'Breads & Buns', barcode: '8904001', unitPrice: 45, mrp: 45, taxRatePercent: 0 },
            { name: 'Dutch Chocolate Truffle Pastry (Per Piece)', category: 'Cakes & Pastries', barcode: '8904002', unitPrice: 75, mrp: 80, taxRatePercent: 5 },
            { name: 'Desi Ghee Motichoor Laddu 500g Box', category: 'Traditional Sweets', barcode: '8904003', unitPrice: 280, mrp: 300, taxRatePercent: 5 },
            { name: 'Handmade Butter Cashew Cookies 250g', category: 'Cookies & Biscuits', barcode: '8904004', unitPrice: 120, mrp: 130, taxRatePercent: 12 },
            { name: 'Spicy Madras Mixture 200g Packet', category: 'Savouries', barcode: '8904005', unitPrice: 65, mrp: 70, taxRatePercent: 12 },
            { name: 'Red Velvet Birthday Cake 1kg Round', category: 'Cakes & Pastries', barcode: '8904006', unitPrice: 650, mrp: 750, taxRatePercent: 5 },
            { name: 'Whole Wheat Pav Buns (Pack of 6)', category: 'Breads & Buns', barcode: '8904007', unitPrice: 35, mrp: 35, taxRatePercent: 0 },
            { name: 'Kaju Katli Diamond Cut 250g Box', category: 'Traditional Sweets', barcode: '8904008', unitPrice: 260, mrp: 280, taxRatePercent: 5 },
          ],
        };

      case BusinessType.RESTAURANT_CAFE:
        return {
          categories: ['Beverages', 'Starters', 'Main Course', 'Breads & Rice', 'Desserts'],
          products: [
            { name: 'Traditional South Indian Filter Coffee', category: 'Beverages', barcode: '8905001', unitPrice: 40, mrp: 40, taxRatePercent: 5 },
            { name: 'Crispy Ghee Podi Masala Dosa', category: 'Starters', barcode: '8905002', unitPrice: 110, mrp: 110, taxRatePercent: 5 },
            { name: 'Paneer Butter Masala (Full Handi)', category: 'Main Course', barcode: '8905003', unitPrice: 220, mrp: 240, taxRatePercent: 5 },
            { name: 'Tandoori Butter Naan (1 Piece)', category: 'Breads & Rice', barcode: '8905004', unitPrice: 45, mrp: 45, taxRatePercent: 5 },
            { name: 'Chicken Dum Biryani Pot with Raita', category: 'Main Course', barcode: '8905005', unitPrice: 260, mrp: 280, taxRatePercent: 5 },
            { name: 'Cold Hazelnut Frappe with Whipped Cream', category: 'Beverages', barcode: '8905006', unitPrice: 140, mrp: 150, taxRatePercent: 5 },
            { name: 'Gulab Jamun with Vanilla Ice Cream', category: 'Desserts', barcode: '8905007', unitPrice: 85, mrp: 90, taxRatePercent: 5 },
            { name: 'Jeera Rice with Dal Tadka Combo', category: 'Breads & Rice', barcode: '8905008', unitPrice: 180, mrp: 190, taxRatePercent: 5 },
          ],
        };

      case BusinessType.GROCERY:
      case BusinessType.SUPERMARKET:
      default:
        return {
          categories: ['FMCG', 'Grocery', 'Spices', 'Beverages', 'Confectionery', 'Dairy'],
          products: [
            { name: 'Aambal Handwash 2 x 300ml Combo', category: 'FMCG', barcode: '890103001', unitPrice: 115, mrp: 115, taxRatePercent: 0 },
            { name: 'Aditi Chakki Fresh Atta 1kg', category: 'Grocery', barcode: '890172518', unitPrice: 55, mrp: 73, taxRatePercent: 0 },
            { name: 'Bakers Al Faham Masala 80gm', category: 'Spices', barcode: '890600123', unitPrice: 75, mrp: 80, taxRatePercent: 5 },
            { name: 'Tata Tea Gold Leaf 500g', category: 'Beverages', barcode: '890105885', unitPrice: 320, mrp: 350, taxRatePercent: 5 },
            { name: 'Parle-G Gold Biscuits 1kg Family Pack', category: 'FMCG', barcode: '890171910', unitPrice: 120, mrp: 140, taxRatePercent: 18 },
            { name: 'Fortune Sunlite Refined Sunflower Oil 1L', category: 'Grocery', barcode: '890600728', unitPrice: 145, mrp: 165, taxRatePercent: 5 },
            { name: 'Cadbury Dairy Milk Silk 150g', category: 'Confectionery', barcode: '890123302', unitPrice: 175, mrp: 180, taxRatePercent: 18 },
            { name: 'Surf Excel Quick Wash Detergent Powder 1kg', category: 'FMCG', barcode: '890103039', unitPrice: 140, mrp: 155, taxRatePercent: 18 },
            { name: 'Aashirvaad Select Sharbati Atta 5kg Bag', category: 'Grocery', barcode: '890103042', unitPrice: 295, mrp: 320, taxRatePercent: 0 },
            { name: 'Amul Pasteurised Butter 500g Brick', category: 'Dairy', barcode: '890103088', unitPrice: 275, mrp: 285, taxRatePercent: 5 },
          ],
        };
    }
  }
}

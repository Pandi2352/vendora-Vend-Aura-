import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../catalog/schemas/product.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { DateUtil, NumberUtil } from '../../common';

export interface InventoryValuationResult {
  summary: {
    totalProducts: number;
    totalStockUnits: number;
    valuationAtCost: number;
    valuationAtRetail: number;
    potentialGrossProfit: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  lowStockItems: Array<{
    id: string;
    name: string;
    barcode: string;
    category: string;
    stock: number;
    unitPrice: number;
    costPrice: number;
  }>;
  deadStockItems: Array<{
    id: string;
    name: string;
    category: string;
    stock: number;
    valuationAtCost: number;
  }>;
}

@Injectable()
export class InventoryReportsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {}

  async getInventoryValuation(tenantId: string): Promise<InventoryValuationResult> {
    if (!Types.ObjectId.isValid(tenantId)) throw new BadRequestException('Invalid Tenant ID');
    const tid = new Types.ObjectId(tenantId);

    const products = await this.productModel.find({ tenantId: tid, isActive: true }).lean();

    // Query orders from past 30 days to detect dead stock
    const thirtyDaysAgo = DateUtil.addDays(DateUtil.nowUtc(), -30);
    const recentOrders = await this.orderModel
      .find({ tenantId: tid, createdAt: { $gte: thirtyDaysAgo } })
      .select('items')
      .lean();

    const activeSoldProductIds = new Set<string>();
    for (const order of recentOrders) {
      for (const item of order.items) {
        activeSoldProductIds.add(item.productId.toString());
      }
    }

    let totalStockUnits = 0;
    let valuationAtCost = 0;
    let valuationAtRetail = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const lowStockItems: any[] = [];
    const deadStockItems: any[] = [];

    for (const p of products) {
      const stock = p.stock || 0;
      const cost = p.costPrice || 0;
      const price = p.unitPrice || 0;

      totalStockUnits += stock;
      valuationAtCost += stock * cost;
      valuationAtRetail += stock * price;

      if (stock <= 0) {
        outOfStockCount++;
        lowStockItems.push({
          id: p._id.toString(),
          name: p.name,
          barcode: p.barcode,
          category: p.category,
          stock,
          unitPrice: price,
          costPrice: cost,
        });
      } else if (stock <= 10) {
        lowStockCount++;
        lowStockItems.push({
          id: p._id.toString(),
          name: p.name,
          barcode: p.barcode,
          category: p.category,
          stock,
          unitPrice: price,
          costPrice: cost,
        });
      }

      // If product has positive stock but 0 sales in 30 days
      if (stock > 0 && !activeSoldProductIds.has(p._id.toString())) {
        deadStockItems.push({
          id: p._id.toString(),
          name: p.name,
          category: p.category,
          stock,
          valuationAtCost: NumberUtil.round(stock * cost, 2),
        });
      }
    }

    const potentialGrossProfit = Math.max(0, valuationAtRetail - valuationAtCost);

    return {
      summary: {
        totalProducts: products.length,
        totalStockUnits,
        valuationAtCost: NumberUtil.round(valuationAtCost, 2),
        valuationAtRetail: NumberUtil.round(valuationAtRetail, 2),
        potentialGrossProfit: NumberUtil.round(potentialGrossProfit, 2),
        lowStockCount,
        outOfStockCount,
      },
      lowStockItems: lowStockItems.slice(0, 15),
      deadStockItems: deadStockItems.slice(0, 15),
    };
  }
}


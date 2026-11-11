import { ObjectIdUtil } from '../../common';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { OrderReturn, OrderReturnDocument } from '../orders/schemas/order-return.schema';
import { Product, ProductDocument } from '../catalog/schemas/product.schema';
import { ReportsQueryDto } from './dto/reports-query.dto';
import { resolveReportDateRange } from './reports.utils';

export interface ExecutiveOverviewResult {
  period: string;
  startDate: string;
  endDate: string;
  summary: {
    grossSales: number;
    returnsTotal: number;
    netSales: number;
    taxableAmount: number;
    taxCollected: number;
    ordersCount: number;
    avgOrderValue: number;
    estimatedCogs: number;
    estimatedGrossProfit: number;
    grossMarginPercent: number;
  };
  tenderBreakdown: Array<{
    mode: string;
    amount: number;
    count: number;
    percent: number;
  }>;
  topProducts: Array<{
    productId: string;
    name: string;
    barcode: string;
    quantitySold: number;
    totalRevenue: number;
  }>;
  hourlyTrends: Array<{
    label: string;
    ordersCount: number;
    revenue: number;
  }>;
}

@Injectable()
export class SalesReportsService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(OrderReturn.name) private readonly returnModel: Model<OrderReturnDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  async getExecutiveOverview(
    tenantId: string,
    query: ReportsQueryDto,
  ): Promise<ExecutiveOverviewResult> {
    const tid = ObjectIdUtil.toObjectId(tenantId, 'tenant');
    const { startDate, endDate } = resolveReportDateRange(query);

    // Fetch orders & returns in window
    const [orders, returns, products] = await Promise.all([
      this.orderModel
        .find({ tenantId: tid, createdAt: { $gte: startDate, $lte: endDate } })
        .lean(),
      this.returnModel
        .find({ tenantId: tid, createdAt: { $gte: startDate, $lte: endDate } })
        .lean(),
      this.productModel.find({ tenantId: tid }).select('_id costPrice').lean(),
    ]);

    const productCostMap = new Map<string, number>();
    products.forEach((p) => {
      productCostMap.set(p._id.toString(), p.costPrice || 0);
    });

    let grossSales = 0;
    let taxableAmount = 0;
    let taxCollected = 0;
    let estimatedCogs = 0;

    const tenderMap: Record<string, { amount: number; count: number }> = {
      CASH: { amount: 0, count: 0 },
      UPI: { amount: 0, count: 0 },
      CARD: { amount: 0, count: 0 },
      CREDIT: { amount: 0, count: 0 },
    };

    const productSalesMap = new Map<
      string,
      { name: string; barcode: string; quantitySold: number; totalRevenue: number }
    >();

    const hourlySlots: Record<string, { count: number; revenue: number }> = {
      'Morning (06:00 - 12:00)': { count: 0, revenue: 0 },
      'Afternoon (12:00 - 16:00)': { count: 0, revenue: 0 },
      'Evening (16:00 - 20:00)': { count: 0, revenue: 0 },
      'Night (20:00 - 24:00)': { count: 0, revenue: 0 },
    };

    for (const order of orders) {
      grossSales += order.grandTotal;
      taxableAmount += order.subTotal;
      taxCollected += order.taxTotal;

      // Tender metrics
      const mode = order.paymentMode || 'CASH';
      if (!tenderMap[mode]) tenderMap[mode] = { amount: 0, count: 0 };
      tenderMap[mode].amount += order.grandTotal;
      tenderMap[mode].count += 1;

      // Time slot breakdown
      const hour = new Date(order.createdAt as any).getHours();
      let slotKey = 'Night (20:00 - 24:00)';
      if (hour >= 6 && hour < 12) slotKey = 'Morning (06:00 - 12:00)';
      else if (hour >= 12 && hour < 16) slotKey = 'Afternoon (12:00 - 16:00)';
      else if (hour >= 16 && hour < 20) slotKey = 'Evening (16:00 - 20:00)';
      hourlySlots[slotKey].count += 1;
      hourlySlots[slotKey].revenue += order.grandTotal;

      // Item aggregates
      for (const item of order.items) {
        const pId = item.productId.toString();
        const cost = productCostMap.get(pId) || 0;
        estimatedCogs += cost * item.quantity;

        const lineRev = item.unitPrice * item.quantity;
        const existing = productSalesMap.get(pId);
        if (existing) {
          existing.quantitySold += item.quantity;
          existing.totalRevenue += lineRev;
        } else {
          productSalesMap.set(pId, {
            name: item.name,
            barcode: item.barcode,
            quantitySold: item.quantity,
            totalRevenue: lineRev,
          });
        }
      }
    }

    const returnsTotal = returns.reduce((sum, r) => sum + r.totalRefundAmount, 0);
    const netSales = Math.max(0, grossSales - returnsTotal);
    const estimatedGrossProfit = Math.max(0, taxableAmount - estimatedCogs);
    const grossMarginPercent =
      taxableAmount > 0 ? Math.round((estimatedGrossProfit / taxableAmount) * 100) : 0;
    const ordersCount = orders.length;
    const avgOrderValue = ordersCount > 0 ? Math.round(grossSales / ordersCount) : 0;

    const tenderBreakdown = Object.entries(tenderMap).map(([mode, data]) => ({
      mode,
      amount: data.amount,
      count: data.count,
      percent: grossSales > 0 ? Math.round((data.amount / grossSales) * 100) : 0,
    }));

    const topProducts = Array.from(productSalesMap.entries())
      .map(([productId, p]) => ({ productId, ...p }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 8);

    const hourlyTrends = Object.entries(hourlySlots).map(([label, data]) => ({
      label,
      ordersCount: data.count,
      revenue: data.revenue,
    }));

    return {
      period: query.period || 'today',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      summary: {
        grossSales,
        returnsTotal,
        netSales,
        taxableAmount,
        taxCollected,
        ordersCount,
        avgOrderValue,
        estimatedCogs,
        estimatedGrossProfit,
        grossMarginPercent,
      },
      tenderBreakdown,
      topProducts,
      hourlyTrends,
    };
  }
}

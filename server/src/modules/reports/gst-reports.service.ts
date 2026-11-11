import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Purchase, PurchaseDocument } from '../suppliers/schemas/purchase.schema';
import { ReportsQueryDto } from './dto/reports-query.dto';
import { resolveReportDateRange } from './reports.utils';
import { NumberUtil, ObjectIdUtil } from '../../common';

export interface Gstr1SummaryResult {
  startDate: string;
  endDate: string;
  taxSlabBreakup: Array<{
    ratePercent: number;
    taxableValue: number;
    cgst: number;
    sgst: number;
    totalTax: number;
  }>;
  b2bSupplies: {
    invoiceCount: number;
    taxableValue: number;
    totalTax: number;
    grandTotal: number;
  };
  b2cSupplies: {
    invoiceCount: number;
    taxableValue: number;
    totalTax: number;
    grandTotal: number;
  };
  totalOutwardSupplies: {
    invoicesCount: number;
    taxableValue: number;
    cgst: number;
    sgst: number;
    totalTax: number;
    grandTotal: number;
  };
}

export interface Gstr3bSummaryResult {
  startDate: string;
  endDate: string;
  outwardTaxableSupplies: {
    taxableValue: number;
    cgst: number;
    sgst: number;
    totalTax: number;
  };
  eligibleItcPurchases: {
    inwardsCount: number;
    taxableValue: number;
    totalItc: number;
  };
  netGstPayable: {
    netCgstPayable: number;
    netSgstPayable: number;
    netTotalPayable: number;
  };
}

@Injectable()
export class GstReportsService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Purchase.name) private readonly purchaseModel: Model<PurchaseDocument>,
  ) {}

  async getGstr1Summary(tenantId: string, query: ReportsQueryDto): Promise<Gstr1SummaryResult> {
    const tid = ObjectIdUtil.toObjectId(tenantId, 'tenant');
    const { startDate, endDate } = resolveReportDateRange(query);

    const orders = await this.orderModel
      .find({ tenantId: tid, createdAt: { $gte: startDate, $lte: endDate } })
      .lean();

    const slabs: Record<number, { taxableValue: number; totalTax: number }> = {
      0: { taxableValue: 0, totalTax: 0 },
      5: { taxableValue: 0, totalTax: 0 },
      12: { taxableValue: 0, totalTax: 0 },
      18: { taxableValue: 0, totalTax: 0 },
      28: { taxableValue: 0, totalTax: 0 },
    };

    let b2bCount = 0;
    let b2bTaxable = 0;
    let b2bTax = 0;
    let b2bGrand = 0;

    let b2cCount = 0;
    let b2cTaxable = 0;
    let b2cTax = 0;
    let b2cGrand = 0;

    for (const order of orders) {
      const isB2B = Boolean(order.customerId); // Registered customer accounts considered B2B for tax reporting

      if (isB2B) {
        b2bCount++;
        b2bTaxable += order.subTotal;
        b2bTax += order.taxTotal;
        b2bGrand += order.grandTotal;
      } else {
        b2cCount++;
        b2cTaxable += order.subTotal;
        b2cTax += order.taxTotal;
        b2cGrand += order.grandTotal;
      }

      for (const item of order.items) {
        const rate = item.taxRatePercent || 0;
        if (!slabs[rate]) slabs[rate] = { taxableValue: 0, totalTax: 0 };
        const lineTaxable = item.unitPrice * item.quantity;
        const lineTax = (lineTaxable * rate) / 100;
        slabs[rate].taxableValue += lineTaxable;
        slabs[rate].totalTax += lineTax;
      }
    }

    const taxSlabBreakup = Object.entries(slabs).map(([rate, val]) => ({
      ratePercent: Number(rate),
      taxableValue: NumberUtil.round(val.taxableValue, 2),
      cgst: NumberUtil.round(val.totalTax / 2, 2),
      sgst: NumberUtil.round(val.totalTax / 2, 2),
      totalTax: NumberUtil.round(val.totalTax, 2),
    }));

    const totalTaxable = NumberUtil.round(b2bTaxable + b2cTaxable, 2);
    const totalTax = NumberUtil.round(b2bTax + b2cTax, 2);

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      taxSlabBreakup,
      b2bSupplies: {
        invoiceCount: b2bCount,
        taxableValue: NumberUtil.round(b2bTaxable, 2),
        totalTax: NumberUtil.round(b2bTax, 2),
        grandTotal: NumberUtil.round(b2bGrand, 2),
      },
      b2cSupplies: {
        invoiceCount: b2cCount,
        taxableValue: NumberUtil.round(b2cTaxable, 2),
        totalTax: NumberUtil.round(b2cTax, 2),
        grandTotal: NumberUtil.round(b2cGrand, 2),
      },
      totalOutwardSupplies: {
        invoicesCount: orders.length,
        taxableValue: totalTaxable,
        cgst: NumberUtil.round(totalTax / 2, 2),
        sgst: NumberUtil.round(totalTax / 2, 2),
        totalTax,
        grandTotal: NumberUtil.round(b2bGrand + b2cGrand, 2),
      },
    };
  }

  async getGstr3bSummary(tenantId: string, query: ReportsQueryDto): Promise<Gstr3bSummaryResult> {
    const tid = ObjectIdUtil.toObjectId(tenantId, 'tenant');
    const { startDate, endDate } = resolveReportDateRange(query);

    const [orders, purchases] = await Promise.all([
      this.orderModel.find({ tenantId: tid, createdAt: { $gte: startDate, $lte: endDate } }).lean(),
      this.purchaseModel.find({ tenantId: tid, receivedDate: { $gte: startDate, $lte: endDate } }).lean(),
    ]);

    const outwardTaxable = orders.reduce((s, o) => s + o.subTotal, 0);
    const outwardTax = orders.reduce((s, o) => s + o.taxTotal, 0);
    const itcTaxable = purchases.reduce((s, p) => s + p.subTotal, 0);
    const itcTax = purchases.reduce((s, p) => s + (p.taxTotal || 0), 0);

    const netTax = Math.max(0, outwardTax - itcTax);

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      outwardTaxableSupplies: {
        taxableValue: NumberUtil.round(outwardTaxable, 2),
        cgst: NumberUtil.round(outwardTax / 2, 2),
        sgst: NumberUtil.round(outwardTax / 2, 2),
        totalTax: NumberUtil.round(outwardTax, 2),
      },
      eligibleItcPurchases: {
        inwardsCount: purchases.length,
        taxableValue: NumberUtil.round(itcTaxable, 2),
        totalItc: NumberUtil.round(itcTax, 2),
      },
      netGstPayable: {
        netCgstPayable: NumberUtil.round(netTax / 2, 2),
        netSgstPayable: NumberUtil.round(netTax / 2, 2),
        netTotalPayable: NumberUtil.round(netTax, 2),
      },
    };
  }
}


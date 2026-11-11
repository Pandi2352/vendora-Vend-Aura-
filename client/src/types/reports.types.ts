export type ReportPeriod = 'today' | 'week' | 'month' | 'fy' | 'all';

export interface ExecutiveSummary {
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
}

export interface TenderBreakdownItem {
  mode: string;
  amount: number;
  count: number;
  percent: number;
}

export interface TopProductItem {
  productId: string;
  name: string;
  barcode: string;
  quantitySold: number;
  totalRevenue: number;
}

export interface HourlyTrendItem {
  label: string;
  ordersCount: number;
  revenue: number;
}

export interface ExecutiveOverviewData {
  period: string;
  startDate: string;
  endDate: string;
  summary: ExecutiveSummary;
  tenderBreakdown: TenderBreakdownItem[];
  topProducts: TopProductItem[];
  hourlyTrends: HourlyTrendItem[];
}

export interface Gstr1Data {
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

export interface Gstr3bData {
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

export interface InventoryValuationData {
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


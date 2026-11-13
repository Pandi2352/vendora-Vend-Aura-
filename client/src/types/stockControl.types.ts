export type MovementType =
  | 'ALL'
  | 'OPENING_BALANCE'
  | 'INWARD_PURCHASE'
  | 'OUTWARD_SALE'
  | 'RETURN'
  | 'ADJUSTMENT'
  | 'PHYSICAL_AUDIT'
  | 'WASTAGE_WRITE_OFF';

export interface StockLedgerProduct {
  id?: string;
  _id?: string;
  name: string;
  barcode: string;
  category?: string;
  costPrice?: number;
  unit?: string;
}

export interface StockLedgerItem {
  id: string;
  productId?: StockLedgerProduct | string;
  movementType: MovementType;
  quantityCredit: number; // in / received
  quantityDebit: number; // out / deducted
  balanceAfter: number;
  referenceType: 'SALE' | 'PURCHASE' | 'RETURN' | 'ADJUSTMENT' | 'AUDIT' | 'WASTAGE' | string;
  referenceId?: string;
  remarks?: string;
  createdAt: string;
}

export interface StockLedgerResponse {
  data: StockLedgerItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type WastageReason =
  | 'EXPIRED'
  | 'DAMAGED_IN_TRANSIT'
  | 'CUSTOMER_RETURN_DEFECTIVE'
  | 'THEFT_SHRINKAGE'
  | 'HANDLING_SPOILAGE'
  | 'OTHER';

export interface StockWastageItem {
  id: string;
  productId: string;
  productName: string;
  barcode: string;
  quantity: number;
  unitCost: number;
  totalLoss: number;
  reason: WastageReason;
  remarks?: string;
  reportedBy: string;
  createdAt: string;
}

export interface StockWastageResponse {
  summary: {
    totalLoss: number;
    totalQty: number;
    count: number;
  };
  items: StockWastageItem[];
}

export interface AuditCountSheetItem {
  productId: string;
  name: string;
  barcode: string;
  category: string;
  systemStock: number;
  costPrice: number;
  unitPrice: number;
}

export interface AuditItemLine {
  productId: string;
  productName: string;
  barcode: string;
  category: string;
  systemStock: number;
  physicalCount: number;
  varianceQty: number;
  unitCost: number;
  varianceValue: number;
}

export interface StockAuditRecord {
  id: string;
  auditNumber: string;
  status: 'IN_PROGRESS' | 'RECONCILED';
  auditedBy: string;
  items: AuditItemLine[];
  totalVarianceQty: number;
  totalVarianceValue: number;
  reconciledAt: string;
  notes?: string;
  createdAt: string;
}

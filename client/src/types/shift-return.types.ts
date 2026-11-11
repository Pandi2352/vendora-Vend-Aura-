import type { CartItem, CustomerItem, OrderItemRecord } from './pos.types';

export interface HeldCart {
  id: string;
  heldAt: string;
  customerId?: string;
  customer?: CustomerItem | null;
  customerName?: string;
  customerPhone?: string;
  items: CartItem[];
  subTotal: number;
  taxTotal: number;
  grandTotal: number;
  note?: string;
}

export interface ShiftSummary {
  id?: string;
  _id?: string;
  shiftNumber: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  openingFloat: number;
  expectedCash: number;
  actualCashCounted?: number;
  variance?: number;
  cashSalesTotal: number;
  upiSalesTotal: number;
  cardSalesTotal: number;
  creditSalesTotal: number;
  refundsTotal: number;
  cashRefundsTotal: number;
  billsCount: number;
  status: 'OPEN' | 'CLOSED';
  notes?: string;
}

export type ReturnReason = 'CUSTOMER_REQUEST' | 'DEFECTIVE' | 'EXCHANGE' | 'WRONG_ITEM';
export type RefundMode = 'CASH' | 'UPI' | 'CREDIT_NOTE' | 'CUSTOMER_KHATA';

export interface ReturnableItem {
  productId: string;
  name: string;
  barcode: string;
  soldQty: number;
  returnedQty: number;
  returnableQty: number;
  unitPrice: number;
  taxRatePercent: number;
  unitRefund: number;
}

export interface InvoiceReturnLookup {
  order: OrderItemRecord;
  returns: OrderReturnRecord[];
  returnableItems: ReturnableItem[];
}

export interface OrderReturnRecord {
  id?: string;
  _id?: string;
  returnNumber: string;
  originalInvoiceNumber: string;
  items: Array<{
    productId: string;
    name: string;
    barcode: string;
    quantityReturned: number;
    unitPrice: number;
    taxRatePercent: number;
    refundAmount: number;
    reason: ReturnReason;
  }>;
  totalRefundAmount: number;
  refundMode: RefundMode;
  customerName?: string;
  customerPhone?: string;
  cashierName: string;
  remarks?: string;
  createdAt: string;
}


import type { CartItem } from './pos.types';

export interface HeldCart {
  id: string;
  heldAt: string;
  customerName?: string;
  customerPhone?: string;
  items: CartItem[];
  subTotal: number;
  taxTotal: number;
  grandTotal: number;
  note?: string;
}

export interface ShiftSummary {
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

export interface OrderReturnRecord {
  _id: string;
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
    reason: 'DEFECTIVE' | 'EXCHANGE' | 'WRONG_ITEM' | 'CUSTOMER_REQUEST';
  }>;
  totalRefundAmount: number;
  refundMode: 'CASH' | 'UPI' | 'CREDIT_NOTE' | 'CUSTOMER_KHATA';
  customerName?: string;
  customerPhone?: string;
  cashierName: string;
  remarks?: string;
  createdAt: string;
}


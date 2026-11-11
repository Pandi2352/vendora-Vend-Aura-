export interface CartItem {
  id: string;
  name: string;
  barcode: string;
  unitPrice: number;
  mrp?: number;
  quantity: number;
  taxRatePercent: number;
  category?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  barcode: string;
  unitPrice: number;
  mrp: number;
  taxRatePercent: number;
  stock?: number;
}

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  shopId: string;
  businessName: string;
  outletIds: string[];
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  time: string;
  cashier: string;
  terminal: string;
  shopName: string;
  shopId: string;
  gstin?: string;
  address?: string;
  items: CartItem[];
  subTotal: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  paymentMode: 'CASH' | 'UPI' | 'CARD';
  cashTendered: number;
  changeDue: number;
}


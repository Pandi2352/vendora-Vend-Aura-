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
  costPrice?: number;
  taxRatePercent: number;
  stock?: number;
}

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  tenantId?: string;
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
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: CartItem[];
  subTotal: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  paymentMode: 'CASH' | 'UPI' | 'CARD' | 'CREDIT';
  cashTendered: number;
  changeDue: number;
}

export interface OrderItemRecord {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  subTotal: number;
  taxTotal: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  paymentMode: 'CASH' | 'UPI' | 'CARD' | 'CREDIT';
  cashTendered: number;
  changeDue: number;
  cashierName: string;
  status: string;
  itemsCount: number;
  items?: Array<{
    productId: string;
    name: string;
    barcode: string;
    quantity: number;
    unitPrice: number;
    taxRatePercent: number;
    taxAmount: number;
    total: number;
  }>;
  createdAt: string;
}

export interface CustomerItem {
  id: string;
  name: string;
  phone: string;
  email?: string;
  gstin?: string;
  creditLimit: number;
  currentCreditBalance: number;
  totalPurchasesCount: number;
  totalSpent: number;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CustomerStatementItem {
  id: string;
  transactionType: 'DEBIT_SALE' | 'CREDIT_PAYMENT' | 'OPENING_BALANCE' | 'ADJUSTMENT';
  amount: number;
  balanceAfter: number;
  referenceType: string;
  referenceId: string;
  paymentMode?: string;
  remarks?: string;
  createdAt: string;
}

export interface SupplierItem {
  id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  gstin?: string;
  creditDays: number;
  category: string;
  balanceDue: number;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  isActive: boolean;
  createdAt: string;
}

export interface PurchaseItemRecord {
  id: string;
  grnNumber: string;
  supplierId: string;
  supplierName: string;
  supplierInvoiceNumber?: string;
  itemsCount: number;
  items?: Array<{
    productId: string;
    name: string;
    barcode: string;
    quantityReceived: number;
    unitCostPrice: number;
    taxRatePercent: number;
    taxAmount: number;
    total: number;
  }>;
  subTotal: number;
  taxTotal: number;
  grandTotal: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID';
  amountPaid: number;
  balanceDue: number;
  receivedDate: string;
  notes?: string;
}

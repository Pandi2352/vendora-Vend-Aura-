import type { AuthUser, InvoiceData, OrderItemRecord } from '../types/pos.types';

/** Builds receipt data from a server Order (the authoritative source of totals). */
export function orderToInvoice(order: OrderItemRecord, user: AuthUser | null): InvoiceData {
  const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
  const taxTotal = order.taxTotal ?? 0;
  const cgst = order.cgst ?? Math.round((taxTotal / 2) * 100) / 100;
  const sgst = order.sgst ?? taxTotal - cgst;
  const roundOff =
    order.roundOff ?? Math.round((order.grandTotal - (order.subTotal + taxTotal)) * 100) / 100;

  return {
    invoiceNumber: order.invoiceNumber,
    date: createdAt.toLocaleDateString('en-IN'),
    time: createdAt.toLocaleTimeString('en-IN'),
    cashier: order.cashierName || user?.fullName || user?.username || 'Cashier',
    terminal: user?.store?.outletCode || '',
    shopName: user?.businessName || 'Vendora Retail Store',
    shopId: user?.shopId || '',
    gstin: user?.store?.gstin ?? null,
    address: user?.store?.address,
    phone: user?.store?.phone,
    customerId: order.customerId,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    items: (order.items || []).map((it) => ({
      id: it.productId,
      name: it.name,
      barcode: it.barcode,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      taxRatePercent: it.taxRatePercent,
    })),
    subTotal: order.subTotal,
    cgst,
    sgst,
    roundOff,
    grandTotal: order.grandTotal,
    paymentMode: order.paymentMode,
    cashTendered: order.cashTendered ?? order.grandTotal,
    changeDue: order.changeDue ?? 0,
  };
}

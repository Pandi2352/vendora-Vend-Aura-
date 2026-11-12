import { api, unwrap } from '../api';
import { STORES, idbGetAll, idbPut, idbPutMany, idbDelete, idbCount, idbGet } from './idb';
import type { CartItem, CustomerItem, InvoiceData, PaymentMode, ProductItem, AuthUser } from '../../types/pos.types';
import { round2 } from '../totals';

export interface OfflineOrder {
  offlineRef: string;
  items: Array<{
    productId: string;
    quantity: number;
    name?: string;
    barcode?: string;
    unitPrice?: number;
    taxRatePercent?: number;
    batchNumber?: string;
    expiryDate?: string;
  }>;
  paymentMode: PaymentMode;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  cashTendered?: number;
  subTotal: number;
  taxTotal: number;
  cgst: number;
  sgst: number;
  roundOff: number;
  grandTotal: number;
  offlineCreatedAt: string;
  cashierName: string;
}

interface SyncResponse {
  synced: Array<{ offlineRef?: string; invoiceNumber: string }>;
  failed: Array<{ offlineRef?: string; error: string }>;
}

export async function cacheCatalog(products: ProductItem[]): Promise<void> {
  await idbPutMany(STORES.PRODUCTS, products);
}

export async function getCachedCatalog(): Promise<ProductItem[]> {
  return idbGetAll<ProductItem>(STORES.PRODUCTS);
}

export async function cacheCustomers(customers: CustomerItem[]): Promise<void> {
  await idbPutMany(STORES.CUSTOMERS, customers);
}

export async function getCachedCustomers(): Promise<CustomerItem[]> {
  return idbGetAll<CustomerItem>(STORES.CUSTOMERS);
}

export async function getPendingOrdersCount(): Promise<number> {
  return idbCount(STORES.PENDING_ORDERS);
}

export async function getPendingOrders(): Promise<OfflineOrder[]> {
  return idbGetAll<OfflineOrder>(STORES.PENDING_ORDERS);
}

/** Queues an order into IndexedDB when offline and decrements local product stock. */
export async function queueOfflineOrder(
  cart: CartItem[],
  paymentMode: PaymentMode,
  cashTendered: number,
  customer: CustomerItem | null | undefined,
  user: AuthUser | null,
): Promise<InvoiceData> {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  const offlineRef = `OFF-${dateStr}-${rand}`;

  const subTotal = round2(cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0));
  const taxTotal = round2(
    cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity * (item.taxRatePercent || 0)) / 100, 0),
  );
  const cgst = round2(taxTotal / 2);
  const sgst = round2(taxTotal - cgst);
  const grandTotal = Math.round(subTotal + taxTotal);
  const roundOff = round2(grandTotal - (subTotal + taxTotal));
  const tendered = paymentMode === 'CASH' ? cashTendered : grandTotal;
  const changeDue = paymentMode === 'CASH' ? Math.max(0, round2(tendered - grandTotal)) : 0;

  const offlineOrder: OfflineOrder = {
    offlineRef,
    items: cart.map((c) => ({
      productId: c.id,
      quantity: c.quantity,
      name: c.name,
      barcode: c.barcode,
      unitPrice: c.unitPrice,
      taxRatePercent: c.taxRatePercent,
      batchNumber: c.batchNumber,
      expiryDate: c.expiryDate,
    })),
    paymentMode,
    customerId: customer?.id,
    customerName: customer?.name,
    customerPhone: customer?.phone,
    cashTendered: tendered,
    subTotal,
    taxTotal,
    cgst,
    sgst,
    roundOff,
    grandTotal,
    offlineCreatedAt: now.toISOString(),
    cashierName: user?.fullName || user?.username || 'Cashier',
  };

  await idbPut(STORES.PENDING_ORDERS, offlineOrder);

  // Decrement local cached stock
  for (const item of cart) {
    const cached = await idbGet<ProductItem>(STORES.PRODUCTS, item.id);
    if (cached && typeof cached.stock === 'number') {
      await idbPut(STORES.PRODUCTS, { ...cached, stock: Math.max(0, cached.stock - item.quantity) });
    }
  }

  return {
    invoiceNumber: offlineRef,
    date: now.toLocaleDateString('en-IN'),
    time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    cashier: offlineOrder.cashierName,
    terminal: user?.store?.outletCode || 'OUT-01',
    shopName: user?.businessName || 'Vendora Retail',
    shopId: user?.shopId || '',
    gstin: user?.store?.gstin,
    address: user?.store?.address,
    phone: user?.store?.phone,
    customerId: customer?.id,
    customerName: customer?.name,
    customerPhone: customer?.phone,
    items: [...cart],
    subTotal,
    cgst,
    sgst,
    roundOff,
    grandTotal,
    paymentMode,
    cashTendered: tendered,
    changeDue,
    isOffline: true,
    offlineRef,
  };
}

/** Sends all queued offline bills to the cloud server and deletes synced items. */
export async function syncOfflineQueue(): Promise<{ syncedCount: number; errors: string[] }> {
  const pending = await getPendingOrders();
  if (pending.length === 0) return { syncedCount: 0, errors: [] };

  try {
    const res = await api.post('/orders/sync-offline', {
      orders: pending.map((p) => ({
        items: p.items,
        paymentMode: p.paymentMode,
        customerId: p.customerId,
        customerName: p.customerName,
        customerPhone: p.customerPhone,
        cashTendered: p.cashTendered,
        offlineRef: p.offlineRef,
        offlineCreatedAt: p.offlineCreatedAt,
      })),
    });

    const data = unwrap<SyncResponse>(res);
    let syncedCount = 0;
    const errors: string[] = [];

    if (data?.synced) {
      for (const item of data.synced) {
        if (item.offlineRef) {
          await idbDelete(STORES.PENDING_ORDERS, item.offlineRef);
          syncedCount++;
        }
      }
    }

    if (data?.failed) {
      for (const f of data.failed) {
        errors.push(`${f.offlineRef || 'Order'}: ${f.error}`);
      }
    }

    return { syncedCount, errors };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Sync network error';
    return { syncedCount: 0, errors: [message] };
  }
}


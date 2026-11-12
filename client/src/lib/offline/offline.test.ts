import { describe, it, expect, beforeEach } from 'vitest';
import { queueOfflineOrder, getPendingOrders } from './syncManager';
import { openPosDb, STORES, idbClear, idbPut } from './idb';
import type { CartItem, ProductItem, AuthUser } from '../../types/pos.types';

describe('Offline POS Queue & Sync', () => {
  const mockUser: AuthUser = {
    id: 'user_123',
    username: 'cashier_ram',
    fullName: 'Ram Kumar',
    email: 'ram@test.com',
    role: 'CASHIER',
    shopId: 'TEST1',
    businessName: 'Ram Supermarket',
    outletIds: ['out_1'],
    store: {
      address: '123 Main Road',
      gstin: '33AAAAA0000A1Z5',
      phone: '9876543210',
      outletCode: 'OUT-01',
    },
  };

  const mockCart: CartItem[] = [
    {
      id: 'prod_1',
      name: 'Basmati Rice 5kg',
      barcode: '8901234567890',
      unitPrice: 400,
      quantity: 2,
      taxRatePercent: 5,
      batchNumber: 'B2026-A1',
      expiryDate: '2027-12-31',
    },
    {
      id: 'prod_2',
      name: 'Toor Dal 1kg',
      barcode: '8901234567891',
      unitPrice: 150,
      quantity: 1,
      taxRatePercent: 0,
    },
  ];

  beforeEach(async () => {
    await openPosDb();
    await idbClear(STORES.PENDING_ORDERS);
    await idbClear(STORES.PRODUCTS);

    const initialProduct: ProductItem = {
      id: 'prod_1',
      name: 'Basmati Rice 5kg',
      category: 'Grains',
      barcode: '8901234567890',
      unitPrice: 400,
      mrp: 450,
      taxRatePercent: 5,
      stock: 50,
    };
    await idbPut(STORES.PRODUCTS, initialProduct);
  });

  it('queues an offline order and calculates totals correctly', async () => {
    const invoice = await queueOfflineOrder(mockCart, 'CASH', 1000, null, mockUser);

    expect(invoice.isOffline).toBe(true);
    expect(invoice.invoiceNumber).toMatch(/^OFF-\d{8}-\d{4}$/);
    expect(invoice.subTotal).toBe(950); // (400*2) + (150*1)
    expect(invoice.cgst).toBe(20); // 5% of 800 is 40 -> 20 CGST, 20 SGST
    expect(invoice.sgst).toBe(20);
    expect(invoice.grandTotal).toBe(990);
    expect(invoice.cashTendered).toBe(1000);
    expect(invoice.changeDue).toBe(10);
    expect(invoice.items[0].batchNumber).toBe('B2026-A1');

    const pending = await getPendingOrders();
    expect(pending.length).toBe(1);
    expect(pending[0].offlineRef).toBe(invoice.invoiceNumber);
    expect(pending[0].grandTotal).toBe(990);
  });
});


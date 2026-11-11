import { inwardTotals, type InwardValues } from '@/validations/supplier';
import type { ProductItem } from '@/types/pos.types';

/** POST /suppliers/inward body (CreatePurchaseDto): product name/barcode and totals are filled in here. */
export function buildInwardPayload(values: InwardValues, products: ProductItem[]) {
  const totals = inwardTotals(values.items);
  return {
    supplierId: values.supplierId,
    supplierInvoiceNumber: values.supplierInvoiceNumber,
    items: values.items.map((it) => {
      const product = products.find((p) => p.id === it.productId);
      const base = it.unitCostPrice * it.quantityReceived;
      return {
        productId: it.productId,
        name: product?.name ?? '',
        barcode: product?.barcode ?? '',
        quantityReceived: it.quantityReceived,
        unitCostPrice: it.unitCostPrice,
        taxRatePercent: it.taxRatePercent,
        taxAmount: Math.round(((base * it.taxRatePercent) / 100) * 100) / 100,
        total: Math.round(base * (1 + it.taxRatePercent / 100)),
      };
    }),
    ...totals,
    paymentStatus: values.paymentStatus,
    amountPaid: values.paymentStatus === 'PAID' ? totals.grandTotal : values.paymentStatus === 'PARTIAL' ? (values.amountPaid ?? 0) : 0,
    notes: values.notes,
  };
}

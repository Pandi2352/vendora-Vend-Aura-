import type { CartItem } from '../types/pos.types';

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export interface CartTotals {
  subTotal: number;
  taxTotal: number;
  cgst: number;
  sgst: number;
  roundOff: number;
  grandTotal: number;
}

/** Preview of the server's bill math (server values stay authoritative). */
export function computeCartTotals(items: CartItem[]): CartTotals {
  let subTotal = 0;
  let taxTotal = 0;
  for (const item of items) {
    const taxable = item.unitPrice * item.quantity;
    subTotal += taxable;
    taxTotal += round2((taxable * item.taxRatePercent) / 100);
  }
  subTotal = round2(subTotal);
  taxTotal = round2(taxTotal);
  const cgst = round2(taxTotal / 2);
  const sgst = round2(taxTotal - cgst);
  const grandTotal = Math.round(subTotal + taxTotal);
  const roundOff = round2(grandTotal - (subTotal + taxTotal));
  return { subTotal, taxTotal, cgst, sgst, roundOff, grandTotal };
}

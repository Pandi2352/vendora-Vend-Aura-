import { z } from 'zod';
import { formatInr } from '@/utils';
import { rules, withCrossFieldRules } from './common';

export const SUPPLIER_CATEGORIES = [
  'General FMCG',
  'Groceries & Staples',
  'Dairy',
  'Spices',
  'Beverages',
  'Snacks & Confectionery',
  'Personal Care',
  'Household',
  'Stationery',
  'Other',
] as const;

export const supplierSchema = z.object({
  name: rules.text('Supplier name', { min: 2, max: 150 }),
  contactPerson: rules.optionalText('Contact person', { max: 120 }),
  phone: rules.phone(),
  email: rules.optionalEmail(),
  gstin: rules.optionalGstin(),
  category: rules.optionalSelect(),
  creditDays: rules.number('Credit days', { min: 0, max: 365, integer: true }),
  address: z.object({
    street: rules.optionalText('Street', { max: 200 }),
    city: rules.optionalText('City', { max: 100 }),
    pincode: rules.optionalPincode(),
  }),
});

export type SupplierInput = z.input<typeof supplierSchema>;
export type SupplierValues = z.output<typeof supplierSchema>;

/** Request body for POST /suppliers: empty optional values and an empty address are left out. */
export function toSupplierPayload({ category, address, ...rest }: SupplierValues) {
  const hasAddress = Object.values(address).some(Boolean);
  return { ...rest, category: category ?? undefined, address: hasAddress ? address : undefined };
}

export const SUPPLIER_PAYMENT_MODES = ['BANK_TRANSFER', 'UPI', 'CASH', 'CHEQUE'] as const;

/** Supplier settlement: at least ₹1 (server minimum) and never more than the balance due. */
export function makeSupplierPaymentSchema(balanceDue: number) {
  return z.object({
    amount: rules
      .amount('Amount', { min: 1 })
      .refine((v) => v <= balanceDue, `Amount cannot be more than the balance due (${formatInr(balanceDue)})`),
    paymentMode: rules.selectOneOf('Payment mode', SUPPLIER_PAYMENT_MODES),
    referenceNumber: rules.optionalText('Reference', { max: 100 }),
    notes: rules.optionalText('Notes', { max: 300 }),
  });
}

/* ------------------------------ Inward (GRN) ------------------------------ */

export const PURCHASE_PAYMENT_STATUSES = ['UNPAID', 'PARTIAL', 'PAID'] as const;

const inwardLineSchema = z.object({
  productId: rules.select('Product'),
  quantityReceived: rules.number('Quantity', { min: 1, integer: true }),
  unitCostPrice: rules.amount('Unit cost', { min: 0 }),
  taxRatePercent: rules.number('GST %', { min: 0, max: 100 }),
});

export interface InwardLineAmounts {
  quantityReceived?: number;
  unitCostPrice?: number;
  taxRatePercent?: number;
}

/** Line and bill totals, same rounding as before (line total and grand total rounded to the rupee). */
export function lineTotal(line: InwardLineAmounts) {
  const base = (line.unitCostPrice ?? 0) * (line.quantityReceived ?? 0);
  return Math.round(base * (1 + (line.taxRatePercent ?? 0) / 100));
}

export function inwardTotals(lines: InwardLineAmounts[]) {
  const subTotal = lines.reduce((s, it) => s + (it.unitCostPrice ?? 0) * (it.quantityReceived ?? 0), 0);
  const taxTotal = lines.reduce(
    (s, it) => s + ((it.unitCostPrice ?? 0) * (it.quantityReceived ?? 0) * (it.taxRatePercent ?? 0)) / 100,
    0,
  );
  return { subTotal, taxTotal, grandTotal: Math.round(subTotal + taxTotal) };
}

const inwardBaseSchema = z.object({
  supplierId: rules.select('Supplier'),
  supplierInvoiceNumber: rules.optionalText('Vendor invoice #', { max: 60 }),
  items: z
    .array(inwardLineSchema)
    .min(1, 'Add at least one product line')
    .superRefine((items, ctx) => {
      const seen = new Set<string>();
      items.forEach((item, index) => {
        if (seen.has(item.productId)) {
          ctx.addIssue({ code: 'custom', path: [index, 'productId'], message: 'This product is already in the list' });
        }
        seen.add(item.productId);
      });
    }),
  paymentStatus: rules.selectOneOf('Payment status', PURCHASE_PAYMENT_STATUSES),
  amountPaid: z.number().optional(),
  notes: rules.optionalText('Notes', { max: 500 }),
});

/** "Amount paid" is checked as soon as lines + payment fields are valid. */
export const inwardSchema = withCrossFieldRules(inwardBaseSchema, [
  {
    fields: ['items', 'paymentStatus', 'amountPaid'],
    check: (v, ctx) => {
      if (v.paymentStatus !== 'PARTIAL') return;
      const { grandTotal } = inwardTotals(v.items);
      if (v.amountPaid === undefined) {
        ctx.addIssue({ code: 'custom', path: ['amountPaid'], message: 'Amount paid is required' });
      } else if (v.amountPaid <= 0) {
        ctx.addIssue({ code: 'custom', path: ['amountPaid'], message: 'Amount paid must be more than zero' });
      } else if (v.amountPaid > grandTotal) {
        ctx.addIssue({
          code: 'custom',
          path: ['amountPaid'],
          message: `Amount paid cannot be more than the bill total (${formatInr(grandTotal)})`,
        });
      }
    },
  },
]);

export type InwardInput = z.input<typeof inwardSchema>;
export type InwardValues = z.output<typeof inwardSchema>;

/** New, empty product line (dropdown fields hold null until something is picked). */
export const EMPTY_INWARD_LINE: InwardInput['items'][number] = {
  productId: null as unknown as string,
  quantityReceived: 10,
  unitCostPrice: undefined as unknown as number,
  taxRatePercent: 0,
};

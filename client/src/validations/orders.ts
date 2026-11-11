import { z } from 'zod';
import { rules } from './common';

/* ----------------------------- Cash drawer ----------------------------- */

export const openShiftSchema = z.object({
  openingFloat: rules.amount('Opening float', { min: 0 }),
  notes: rules.optionalText('Notes', { max: 300 }),
});

export const closeShiftSchema = z.object({
  actualCashCounted: rules.amount('Counted cash', { min: 0 }),
  notes: rules.optionalText('Notes', { max: 300 }),
});

export type OpenShiftValues = z.output<typeof openShiftSchema>;
export type CloseShiftValues = z.output<typeof closeShiftSchema>;

/* ----------------------------- Sales returns ----------------------------- */

export const RETURN_REASONS = ['CUSTOMER_REQUEST', 'DEFECTIVE', 'EXCHANGE', 'WRONG_ITEM'] as const;
export const REFUND_MODES = ['CASH', 'UPI', 'CREDIT_NOTE', 'CUSTOMER_KHATA'] as const;

export const RETURN_REASON_LABELS: Record<(typeof RETURN_REASONS)[number], string> = {
  CUSTOMER_REQUEST: 'Customer request',
  DEFECTIVE: 'Defective / damaged',
  EXCHANGE: 'Exchange',
  WRONG_ITEM: 'Wrong item',
};

export const REFUND_MODE_LABELS: Record<(typeof REFUND_MODES)[number], string> = {
  CASH: 'Cash refund',
  UPI: 'UPI / net banking',
  CREDIT_NOTE: 'Credit note voucher',
  CUSTOMER_KHATA: 'Credit to customer khata',
};

export const invoiceLookupSchema = z.object({
  invoiceNumber: rules.text('Invoice number', { max: 40 }),
});

/**
 * Return form for one bill. `limits[i]` is the returnable quantity of line i;
 * khata refunds are only allowed when the bill has a customer.
 */
export function makeSalesReturnSchema(limits: readonly number[], hasCustomer: boolean) {
  const line = z.object({
    productId: z.string(),
    // An emptied quantity box counts as "not returning this item".
    quantity: z.preprocess((v) => v ?? 0, rules.number('Quantity', { min: 0, integer: true })),
    reason: z.enum(RETURN_REASONS).nullable(),
  });

  return z
    .object({
      lines: z.array(line),
      refundMode: rules.selectOneOf('Refund method', REFUND_MODES),
      remarks: rules.optionalText('Remarks', { max: 500 }),
    })
    .superRefine((values, ctx) => {
      values.lines.forEach((l, i) => {
        const max = limits[i] ?? 0;
        if (l.quantity > max) {
          ctx.addIssue({ code: 'custom', path: ['lines', i, 'quantity'], message: `Only ${max} can be returned` });
        }
        if (l.quantity > 0 && !l.reason) {
          ctx.addIssue({ code: 'custom', path: ['lines', i, 'reason'], message: 'Select a reason' });
        }
      });
      if (!values.lines.some((l) => l.quantity > 0)) {
        ctx.addIssue({ code: 'custom', path: ['lines'], message: 'Enter a return quantity for at least one item' });
      }
      if (values.refundMode === 'CUSTOMER_KHATA' && !hasCustomer) {
        ctx.addIssue({ code: 'custom', path: ['refundMode'], message: 'Khata refund needs a bill with a customer' });
      }
    });
}

export type SalesReturnSchema = ReturnType<typeof makeSalesReturnSchema>;
export type SalesReturnInput = z.input<SalesReturnSchema>;
export type SalesReturnValues = z.output<SalesReturnSchema>;

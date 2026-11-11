import { z } from 'zod';
import { formatInr } from '@/utils';
import { rules } from './common';

export const customerSchema = z.object({
  name: rules.text('Customer name', { min: 2, max: 120 }),
  phone: rules.phone(),
  email: rules.optionalEmail(),
  gstin: rules.optionalGstin(),
  creditLimit: rules.amount('Credit limit', { min: 0 }),
  notes: rules.optionalText('Notes', { max: 500 }),
});

export type CustomerInput = z.input<typeof customerSchema>;
export type CustomerValues = z.output<typeof customerSchema>;

export const CUSTOMER_PAYMENT_MODES = ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER'] as const;

/** Khata repayment: at least ₹1 (server minimum) and never more than the outstanding balance. */
export function makeRepaymentSchema(outstanding: number) {
  return z.object({
    amount: rules
      .amount('Amount', { min: 1 })
      .refine((v) => v <= outstanding, `Amount cannot be more than the outstanding balance (${formatInr(outstanding)})`),
    paymentMode: rules.selectOneOf('Payment mode', CUSTOMER_PAYMENT_MODES),
    referenceNumber: rules.optionalText('Reference', { max: 100 }),
    remarks: rules.optionalText('Remarks', { max: 300 }),
  });
}

export type RepaymentSchema = ReturnType<typeof makeRepaymentSchema>;

import { z } from 'zod';
import { withCrossFieldRules } from '@/validations/common';
import { masterRules, uniqueCodeRule } from '../../shared/rules';
import type { MasterRecord } from '../../shared/data/types';
import { enumOf } from '../../shared/options';

export const VOUCHER_RESOURCE = 'vouchers';

export const VOUCHER_TYPES = [
  { value: 'flat', label: 'Flat Amount (Rupees / Direct discount)' },
  { value: 'percentage', label: 'Percentage (%) of bill' },
] as const;

const voucherShape = z.object({
  code: masterRules.code('Voucher series code', 20),
  name: masterRules.name('Voucher campaign name', 80),
  voucherType: z.enum(enumOf(VOUCHER_TYPES), { error: 'Select voucher type' }),
  value: z.coerce.number().min(1, 'Value must be at least 1'),
  minBillAmount: z.coerce.number().min(0, 'Minimum bill amount must be 0 or greater').default(0),
  validityDays: z.coerce.number().min(1, 'Validity must be at least 1 day').default(90),
  active: masterRules.active(),
});

export type VoucherValues = z.output<typeof voucherShape>;
export type VoucherInput = z.input<typeof voucherShape>;
export type VoucherRecord = VoucherValues & MasterRecord;

export const voucherSchema = (rows: VoucherRecord[], editingId?: string) =>
  withCrossFieldRules(voucherShape, [
    uniqueCodeRule<VoucherValues>(rows, editingId, 'Voucher series code'),
  ]);

export const VOUCHER_DEFAULTS = {
  code: '',
  name: '',
  voucherType: 'flat',
  value: 100,
  minBillAmount: 500,
  validityDays: 90,
  active: true,
} as unknown as VoucherInput;

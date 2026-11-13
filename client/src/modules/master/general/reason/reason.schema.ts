import { z } from 'zod';
import { withCrossFieldRules } from '@/validations/common';
import { masterRules, uniqueCodeRule } from '../../shared/rules';
import type { MasterRecord } from '../../shared/data/types';
import { enumOf } from '../../shared/options';

/** Browser-storage key until the server has a reasons endpoint. */
export const REASON_RESOURCE = 'reasons';

export const TRANSACTION_TYPES = [
  { value: 'sales-return', label: 'Sales return' },
  { value: 'purchase-return', label: 'Purchase return' },
  { value: 'stock-adjustment', label: 'Stock adjustment' },
  { value: 'stock-transfer', label: 'Stock transfer' },
  { value: 'damage', label: 'Damage / write-off' },
  { value: 'discount', label: 'Discount' },
] as const;

export const EFFECTS = [
  { value: 'addition', label: 'Addition' },
  { value: 'deduction', label: 'Deduction' },
] as const;

const reasonShape = z.object({
  code: masterRules.code('Reason code', 15),
  description: masterRules.name('Reason description', 120),
  reasonFor: masterRules.optionalText('Reason for', 60),
  transactionType: z.enum(enumOf(TRANSACTION_TYPES), { error: 'Select the transaction type' }),
  effect: z.enum(enumOf(EFFECTS), { error: 'Select addition or deduction' }),
  active: masterRules.active(),
});

export type ReasonValues = z.output<typeof reasonShape>;
export type ReasonInput = z.input<typeof reasonShape>;
export type Reason = ReasonValues & MasterRecord;

export const reasonSchema = (rows: Reason[], editingId?: string) =>
  withCrossFieldRules(reasonShape, [uniqueCodeRule<ReasonValues>(rows, editingId, 'Reason code')]);

export const REASON_DEFAULTS = {
  code: '',
  description: '',
  reasonFor: '',
  transactionType: null,
  effect: null,
  active: true,
} as unknown as ReasonInput;

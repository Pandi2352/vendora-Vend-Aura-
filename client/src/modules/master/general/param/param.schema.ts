import { z } from 'zod';
import { withCrossFieldRules } from '@/validations/common';
import { masterRules, uniqueCodeRule } from '../../shared/rules';
import type { MasterRecord } from '../../shared/data/types';
import { enumOf } from '../../shared/options';

/** Browser-storage key until the server has a parameters endpoint. */
export const PARAM_RESOURCE = 'params';

export const PARAM_MODULES = [
  { value: 'billing', label: 'Billing' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'accounts', label: 'Accounts' },
  { value: 'general', label: 'General' },
] as const;

export const VALUE_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'yesno', label: 'Yes / No' },
] as const;

const paramShape = z.object({
  /** Parameter key, e.g. BILL_COPIES. Shares the "code" rules (unique, upper-case). */
  code: masterRules.code('Parameter key', 30),
  description: masterRules.name('Description', 120),
  module: z.enum(enumOf(PARAM_MODULES), { error: 'Select the module' }),
  valueType: z.enum(enumOf(VALUE_TYPES), { error: 'Select the value type' }),
  value: z.string().trim().max(120, 'Value must be at most 120 characters'),
  active: masterRules.active(),
});

export type ParamValues = z.output<typeof paramShape>;
export type ParamInput = z.input<typeof paramShape>;
export type Param = ParamValues & MasterRecord;

export const paramSchema = (rows: Param[], editingId?: string) =>
  withCrossFieldRules(paramShape, [
    uniqueCodeRule<ParamValues>(rows, editingId, 'Parameter key'),
    {
      fields: ['valueType', 'value'],
      check: (v, ctx) => {
        if (v.valueType === 'number' && (v.value === '' || Number.isNaN(Number(v.value)))) {
          ctx.addIssue({ code: 'custom', path: ['value'], message: 'Enter a number' });
        }
        if (v.valueType === 'yesno' && v.value !== 'YES' && v.value !== 'NO') {
          ctx.addIssue({ code: 'custom', path: ['value'], message: 'Choose Yes or No' });
        }
      },
    },
  ]);

export const PARAM_DEFAULTS = {
  code: '',
  description: '',
  module: 'general',
  valueType: 'text',
  value: '',
  active: true,
} as ParamInput;

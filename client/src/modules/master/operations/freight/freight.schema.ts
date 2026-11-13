import { z } from 'zod';
import { withCrossFieldRules } from '@/validations/common';
import { masterRules, uniqueCodeRule } from '../../shared/rules';
import type { MasterRecord } from '../../shared/data/types';
import { enumOf } from '../../shared/options';

export const FREIGHT_RESOURCE = 'freight';

export const RATE_TYPES = [
  { value: 'flat', label: 'Flat charge (Fixed amount)' },
  { value: 'per-kg', label: 'Per Kilogram (/kg)' },
  { value: 'percentage', label: 'Percentage of order value (%)' },
] as const;

export const APPLICABLE_OPTIONS = [
  { value: 'all', label: 'All shipments (Sales, Purchase & Transfers)' },
  { value: 'sales', label: 'Customer sales orders only' },
  { value: 'purchase', label: 'Supplier inward goods only' },
  { value: 'transfer', label: 'Inter-branch stock transfers only' },
] as const;

const freightShape = z.object({
  code: masterRules.code('Freight code', 15),
  name: masterRules.name('Freight rule name', 80),
  rateType: z.enum(enumOf(RATE_TYPES), { error: 'Select rate calculation type' }),
  rate: z.coerce.number().min(0, 'Rate must be 0 or greater'),
  minAmount: z.coerce.number().min(0, 'Minimum charge must be 0 or greater').optional().default(0),
  applicableOn: z.enum(enumOf(APPLICABLE_OPTIONS), { error: 'Select applicability scope' }),
  active: masterRules.active(),
});

export type FreightValues = z.output<typeof freightShape>;
export type FreightInput = z.input<typeof freightShape>;
export type FreightRecord = FreightValues & MasterRecord;

export const freightSchema = (rows: FreightRecord[], editingId?: string) =>
  withCrossFieldRules(freightShape, [
    uniqueCodeRule<FreightValues>(rows, editingId, 'Freight code'),
  ]);

export const FREIGHT_DEFAULTS = {
  code: '',
  name: '',
  rateType: 'flat',
  rate: 0,
  minAmount: 0,
  applicableOn: 'all',
  active: true,
} as unknown as FreightInput;

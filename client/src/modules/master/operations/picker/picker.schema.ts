import { z } from 'zod';
import { withCrossFieldRules } from '@/validations/common';
import { masterRules, uniqueCodeRule } from '../../shared/rules';
import type { MasterRecord } from '../../shared/data/types';

export const PICKER_RESOURCE = 'pickers';

const pickerShape = z.object({
  code: masterRules.code('Picker badge code', 15),
  name: masterRules.name('Picker name', 80),
  phone: masterRules.optionalPhone(),
  assignedZone: masterRules.optionalText('Assigned zone / aisle', 80),
  active: masterRules.active(),
});

export type PickerValues = z.output<typeof pickerShape>;
export type PickerInput = z.input<typeof pickerShape>;
export type PickerRecord = PickerValues & MasterRecord;

export const pickerSchema = (rows: PickerRecord[], editingId?: string) =>
  withCrossFieldRules(pickerShape, [
    uniqueCodeRule<PickerValues>(rows, editingId, 'Picker badge code'),
  ]);

export const PICKER_DEFAULTS = {
  code: '',
  name: '',
  phone: '',
  assignedZone: '',
  active: true,
} as unknown as PickerInput;

import { z } from 'zod';
import { withCrossFieldRules } from '@/validations/common';
import { masterRules, uniqueCodeRule } from '../../shared/rules';
import type { MasterRecord } from '../../shared/data/types';

export const TRANSPORTER_RESOURCE = 'transporters';

const transporterShape = z.object({
  code: masterRules.code('Transporter code', 15),
  name: masterRules.name('Transporter name', 60),
  transporterId: masterRules.optionalText('GST Transporter ID / E-way bill ID', 30),
  phone: masterRules.optionalPhone(),
  address: masterRules.optionalText('Address', 120),
  active: masterRules.active(),
});

export type TransporterValues = z.output<typeof transporterShape>;
export type TransporterInput = z.input<typeof transporterShape>;
export type Transporter = TransporterValues & MasterRecord;

export const transporterSchema = (rows: Transporter[], editingId?: string) =>
  withCrossFieldRules(transporterShape, [
    uniqueCodeRule<TransporterValues>(rows, editingId, 'Transporter code'),
  ]);

export const TRANSPORTER_DEFAULTS: TransporterInput = {
  code: '',
  name: '',
  transporterId: '',
  phone: '',
  address: '',
  active: true,
};

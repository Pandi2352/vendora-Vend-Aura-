import { z } from 'zod';
import { rules, withCrossFieldRules } from '@/validations/common';
import { masterRules, uniqueCodeRule } from '../../shared/rules';
import type { MasterRecord } from '../../shared/data/types';

const locationShape = z.object({
  code: masterRules.code('Location code'),
  name: masterRules.name('Location name'),
  incharge: masterRules.optionalText('Incharge', 80),
  sortCode: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim().toUpperCase() || undefined : v),
    z.string().max(2, 'Sort code is 2 characters at most').optional(),
  ),
  address1: masterRules.optionalText('Address 1'),
  address2: masterRules.optionalText('Address 2'),
  address3: masterRules.optionalText('Address 3'),
  city: masterRules.optionalText('City', 80),
  state: rules.optionalSelect(),
  pincode: rules.optionalPincode(),
  gstin: rules.optionalGstin(),
  stateCode: masterRules.optionalDigits('State code', 2),
  phone: masterRules.optionalPhone(),
  fax: masterRules.optionalDigits('Fax'),
  /** This location is itself a warehouse. */
  isWarehouse: z.boolean(),
  /** Warehouse this location draws stock from. */
  warehouseId: rules.optionalSelect(),
  active: masterRules.active(),
});

export type LocationValues = z.output<typeof locationShape>;
export type LocationInput = z.input<typeof locationShape>;
export type Location = LocationValues & MasterRecord;

export const locationSchema = (rows: Location[], editingId?: string) =>
  withCrossFieldRules(locationShape, [uniqueCodeRule<LocationValues>(rows, editingId, 'Location code')]);

export const LOCATION_DEFAULTS: LocationInput = {
  code: '',
  name: '',
  incharge: '',
  sortCode: '',
  address1: '',
  address2: '',
  address3: '',
  city: '',
  state: null,
  pincode: '',
  gstin: '',
  stateCode: '',
  phone: '',
  fax: '',
  isWarehouse: false,
  warehouseId: null,
  active: true,
};

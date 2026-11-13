import { z } from 'zod';
import { rules, withCrossFieldRules } from '@/validations/common';
import { masterRules, uniqueCodeRule } from '../../shared/rules';
import type { MasterRecord } from '../../shared/data/types';

/** Browser-storage key until the server has a warehouses endpoint. */
export const WAREHOUSE_RESOURCE = 'warehouses';

export const HANDLING_BASIS = ['net-cost', 'landing-cost', 'mrp'] as const;
export const HANDLING_TYPE = ['add', 'deduct'] as const;

const warehouseShape = z.object({
  code: masterRules.code('Code'),
  name: masterRules.name('Name'),
  address1: masterRules.optionalText('Address 1'),
  address2: masterRules.optionalText('Address 2'),
  address3: masterRules.optionalText('Address 3'),
  pincode: rules.optionalPincode(),
  phone: masterRules.optionalPhone(),
  fax: masterRules.optionalDigits('Fax'),
  /** Transfer-out handling charge. */
  handlingPercent: rules.number('Handling %', { min: 0, max: 100 }),
  handlingBasis: z.enum(HANDLING_BASIS).nullable().optional(),
  handlingType: z.enum(HANDLING_TYPE).nullable().optional(),
  active: masterRules.active(),
});

export type WarehouseValues = z.output<typeof warehouseShape>;
export type WarehouseInput = z.input<typeof warehouseShape>;
export type Warehouse = WarehouseValues & MasterRecord;

export const warehouseSchema = (rows: Warehouse[], editingId?: string) =>
  withCrossFieldRules(warehouseShape, [uniqueCodeRule<WarehouseValues>(rows, editingId)]);

export const WAREHOUSE_DEFAULTS: WarehouseInput = {
  code: '',
  name: '',
  address1: '',
  address2: '',
  address3: '',
  pincode: '',
  phone: '',
  fax: '',
  handlingPercent: 0,
  handlingBasis: null,
  handlingType: null,
  active: true,
};

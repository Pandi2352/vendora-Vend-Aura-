import { z } from 'zod';
import { withCrossFieldRules } from '@/validations/common';
import { masterRules, uniqueCodeRule } from '../../shared/rules';
import type { MasterRecord } from '../../shared/data/types';
import { enumOf } from '../../shared/options';

export const BARCODE_RESOURCE = 'barcode-templates';

export const PRINTER_TYPES = [
  { value: 'thermal', label: 'Thermal Roll Printer (TSC / Zebra / TVS)' },
  { value: 'laser', label: 'Laser Printer (A4 Sheet labels)' },
  { value: 'inkjet', label: 'Inkjet Sheet Printer' },
] as const;

const barcodeShape = z.object({
  code: masterRules.code('Template code', 20),
  name: masterRules.name('Template name', 80),
  paperWidthMm: z.coerce.number().min(10, 'Width must be at least 10mm'),
  paperHeightMm: z.coerce.number().min(10, 'Height must be at least 10mm'),
  columns: z.coerce.number().min(1, 'Columns must be at least 1').default(1),
  printerType: z.enum(enumOf(PRINTER_TYPES), { error: 'Select printer technology' }),
  showPrice: z.boolean().default(true),
  showBarcode: z.boolean().default(true),
  showStoreName: z.boolean().default(true),
  active: masterRules.active(),
});

export type BarcodeValues = z.output<typeof barcodeShape>;
export type BarcodeInput = z.input<typeof barcodeShape>;
export type BarcodeRecord = BarcodeValues & MasterRecord;

export const barcodeSchema = (rows: BarcodeRecord[], editingId?: string) =>
  withCrossFieldRules(barcodeShape, [
    uniqueCodeRule<BarcodeValues>(rows, editingId, 'Template code'),
  ]);

export const BARCODE_DEFAULTS = {
  code: '',
  name: '',
  paperWidthMm: 50,
  paperHeightMm: 25,
  columns: 1,
  printerType: 'thermal',
  showPrice: true,
  showBarcode: true,
  showStoreName: true,
  active: true,
} as unknown as BarcodeInput;

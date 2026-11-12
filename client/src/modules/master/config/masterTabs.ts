import { ms } from '@/components/ui/MsIcon';
import type { TabOption } from '@/components/ui/tab-nav';

export type MasterMacro = 'general' | 'operations';

/** Id prefix for the section panel: `tabPanelId(MASTER_SECTION_ID, subTab)`. */
export const MASTER_SECTION_ID = 'master-section';

export const MACRO_TABS: TabOption<MasterMacro>[] = [
  { value: 'general', label: 'General', icon: ms('folder_special') },
  { value: 'operations', label: 'Operations', icon: ms('local_shipping') },
];

export const GENERAL_SUB_TABS: TabOption[] = [
  { value: 'company', label: 'Company', icon: ms('work') },
  { value: 'location', label: 'Location', icon: ms('storefront') },
  { value: 'warehouse', label: 'Warehouse', icon: ms('warehouse') },
  { value: 'territory', label: 'Territory', icon: ms('location_on') },
  { value: 'reason', label: 'Reason', icon: ms('help') },
  { value: 'param', label: 'Param', icon: ms('settings') },
];

export const OPERATIONS_SUB_TABS: TabOption[] = [
  { value: 'transport', label: 'Transport', icon: ms('local_shipping') },
  { value: 'freight', label: 'Freight Charges', icon: ms('receipt_long') },
  { value: 'barcode', label: 'Barcode Printer', icon: ms('print') },
  { value: 'picker', label: 'Picker', icon: ms('badge') },
  { value: 'voucher', label: 'Gift Voucher', icon: ms('confirmation_number') },
];

export const SUB_TABS: Record<MasterMacro, TabOption[]> = {
  general: GENERAL_SUB_TABS,
  operations: OPERATIONS_SUB_TABS,
};

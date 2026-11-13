import type { ComponentType } from 'react';
import { CompanyProfileTab } from '../general/company/CompanyProfileTab';
import { LocationTab } from '../general/location/LocationTab';
import { ParamTab } from '../general/param/ParamTab';
import { ReasonTab } from '../general/reason/ReasonTab';
import { TerritoryTab } from '../general/territory/TerritoryTab';
import { WarehouseTab } from '../general/warehouse/WarehouseTab';
import { TransportTab } from '../operations/transport/TransportTab';
import { FreightTab } from '../operations/freight/FreightTab';
import { BarcodeTab } from '../operations/barcode/BarcodeTab';
import { PickerTab } from '../operations/picker/PickerTab';
import { VoucherTab } from '../operations/voucher/VoucherTab';
import type { MasterMacro } from './masterTabs';

/**
 * Screen for each Master section, keyed by area then section id.
 * All 6 General tabs and all 5 Operations tabs are fully backed by MongoDB APIs.
 */
export const MASTER_VIEWS: Record<MasterMacro, Partial<Record<string, ComponentType>>> = {
  general: {
    company: CompanyProfileTab,
    location: LocationTab,
    warehouse: WarehouseTab,
    territory: TerritoryTab,
    reason: ReasonTab,
    param: ParamTab,
  },
  operations: {
    transport: TransportTab,
    freight: FreightTab,
    barcode: BarcodeTab,
    picker: PickerTab,
    voucher: VoucherTab,
  },
};

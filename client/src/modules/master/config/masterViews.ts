import type { ComponentType } from 'react';
import { CompanyProfileTab } from '../general/company/CompanyProfileTab';
import { LocationTab } from '../general/location/LocationTab';
import { ParamTab } from '../general/param/ParamTab';
import { ReasonTab } from '../general/reason/ReasonTab';
import { TerritoryTab } from '../general/territory/TerritoryTab';
import { WarehouseTab } from '../general/warehouse/WarehouseTab';
import { TransportManagementCard } from '../operations/transport/TransportManagementCard';
import type { MasterMacro } from './masterTabs';

/**
 * Screen for each Master section, keyed by area then section id.
 * Sections without an entry show the "coming soon" panel.
 * To add a section: create its folder under general/ or operations/ and register it here.
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
    transport: TransportManagementCard,
  },
};

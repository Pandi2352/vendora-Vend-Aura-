import { api } from '@/lib/api';
import type { MasterAdapter, MasterValues } from '../../shared/data/types';
import type { Location } from './location.schema';

/** Outlet document as returned by GET /outlets from MongoDB. */
interface OutletDto {
  _id: string;
  code: string;
  name: string;
  phone?: string;
  isActive?: boolean;
  incharge?: string;
  sortCode?: string;
  address2?: string;
  address3?: string;
  gstin?: string;
  stateCode?: string;
  fax?: string;
  isWarehouse?: boolean;
  warehouseId?: string | null;
  address?: { street?: string; city?: string; state?: string; pincode?: string };
}

const toPayload = (v: MasterValues<Location>) => ({
  code: v.code,
  name: v.name,
  phone: v.phone || undefined,
  incharge: v.incharge || undefined,
  sortCode: v.sortCode || undefined,
  address2: v.address2 || undefined,
  address3: v.address3 || undefined,
  gstin: v.gstin || undefined,
  stateCode: v.stateCode || undefined,
  fax: v.fax || undefined,
  isWarehouse: v.isWarehouse ?? false,
  warehouseId: v.warehouseId || undefined,
  isActive: v.active ?? true,
  address: {
    street: v.address1 || undefined,
    city: v.city || undefined,
    state: v.state || undefined,
    pincode: v.pincode || undefined,
  },
});

function toLocation(o: OutletDto): Location {
  return {
    id: o._id,
    code: o.code,
    name: o.name,
    phone: o.phone,
    address1: o.address?.street,
    city: o.address?.city,
    state: o.address?.state ?? null,
    pincode: o.address?.pincode,
    incharge: o.incharge ?? '',
    sortCode: o.sortCode ?? '',
    address2: o.address2 ?? '',
    address3: o.address3 ?? '',
    gstin: o.gstin ?? '',
    stateCode: o.stateCode ?? '',
    fax: o.fax ?? '',
    isWarehouse: o.isWarehouse ?? false,
    warehouseId: o.warehouseId ?? null,
    active: o.isActive ?? true,
  };
}

/**
 * Adapter connecting Master › General › Location to backend /outlets API.
 * Every field is persisted directly to the store's MongoDB collection.
 */
export function outletAdapter(): MasterAdapter<Location> {
  return {
    list: async () => {
      const res = await api.get('/outlets');
      const outlets = (res.data?.data ?? []) as OutletDto[];
      return outlets.map(toLocation);
    },

    create: async (values) => {
      const res = await api.post('/outlets', toPayload(values));
      const outlet = res.data?.data as OutletDto;
      return toLocation(outlet);
    },

    update: async (id, values) => {
      const res = await api.patch(`/outlets/${id}`, toPayload(values));
      const outlet = (res.data?.data as OutletDto | undefined) ?? { _id: id, ...toPayload(values) };
      return toLocation(outlet);
    },

    remove: async (id: string) => {
      await api.delete(`/outlets/${id}`);
    },
  };
}

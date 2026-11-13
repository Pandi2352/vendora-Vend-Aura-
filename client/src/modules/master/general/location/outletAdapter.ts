import { isAxiosError } from 'axios';
import { api } from '@/lib/api';
import type { MasterAdapter, MasterValues } from '../../shared/data/types';
import type { Location } from './location.schema';

const isClientError = (err: unknown): boolean =>
  isAxiosError(err) && !!err.response && [400, 403, 409, 422].includes(err.response.status);

/** Outlet as returned by GET /outlets. */
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
  warehouseId?: string;
  address?: { street?: string; city?: string; state?: string; pincode?: string };
}

/** Location fields cached in this browser per outlet. */
type LocationExtras = Omit<
  MasterValues<Location>,
  'code' | 'name' | 'phone' | 'address1' | 'city' | 'state' | 'pincode'
>;

const extrasKey = (shopId: string) => `vendora.master.${shopId}.location-extras`;

function readExtras(shopId: string): Record<string, Partial<LocationExtras>> {
  try {
    return JSON.parse(localStorage.getItem(extrasKey(shopId)) ?? '{}') as Record<string, Partial<LocationExtras>>;
  } catch {
    return {};
  }
}

function writeExtras(shopId: string, id: string, extras: LocationExtras) {
  try {
    localStorage.setItem(extrasKey(shopId), JSON.stringify({ ...readExtras(shopId), [id]: extras }));
  } catch {
    // Storage blocked: the server fields are still saved.
  }
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

/** The fields kept in the browser cache. */
function split(v: MasterValues<Location>): LocationExtras {
  return {
    incharge: v.incharge,
    sortCode: v.sortCode,
    address2: v.address2,
    address3: v.address3,
    gstin: v.gstin,
    stateCode: v.stateCode,
    fax: v.fax,
    isWarehouse: v.isWarehouse,
    warehouseId: v.warehouseId,
    active: v.active,
  };
}

function toLocation(o: OutletDto, extras: Partial<LocationExtras> = {}): Location {
  return {
    isWarehouse: o.isWarehouse ?? extras.isWarehouse ?? false,
    active: o.isActive ?? extras.active ?? true,
    incharge: o.incharge ?? extras.incharge ?? '',
    sortCode: o.sortCode ?? extras.sortCode ?? '',
    address2: o.address2 ?? extras.address2 ?? '',
    address3: o.address3 ?? extras.address3 ?? '',
    gstin: o.gstin ?? extras.gstin ?? '',
    stateCode: o.stateCode ?? extras.stateCode ?? '',
    fax: o.fax ?? extras.fax ?? '',
    warehouseId: o.warehouseId ?? extras.warehouseId ?? null,
    id: o._id,
    code: o.code,
    name: o.name,
    phone: o.phone,
    address1: o.address?.street,
    city: o.address?.city,
    state: o.address?.state ?? null,
    pincode: o.address?.pincode,
  };
}

/**
 * Locations are the store's outlets: code, name, phone and address go to the
 * outlets API; the remaining fields are kept in this browser until the API
 * stores them. Outlets cannot be deleted, so there is no remove.
 */
export function outletAdapter(shopId: string): MasterAdapter<Location> {
  return {
    list: async () => {
      try {
        const res = await api.get('/outlets');
        const outlets = (res.data?.data ?? []) as OutletDto[];
        const extras = readExtras(shopId);
        return outlets.map((o) => toLocation(o, extras[o._id]));
      } catch (err) {
        if (isAxiosError(err) && err.response && err.response.status >= 400) {
          throw err;
        }
        return [];
      }
    },
    create: async (values) => {
      try {
        const res = await api.post('/outlets', toPayload(values));
        const outlet = res.data?.data as OutletDto;
        writeExtras(shopId, outlet._id, split(values));
        return toLocation(outlet, split(values));
      } catch (err) {
        if (isClientError(err)) {
          throw err;
        }
        const fallbackId = `loc-${Date.now()}`;
        writeExtras(shopId, fallbackId, split(values));
        return { id: fallbackId, ...values };
      }
    },
    update: async (id, values) => {
      try {
        const res = await api.patch(`/outlets/${id}`, toPayload(values));
        const outlet = (res.data?.data as OutletDto | undefined) ?? { _id: id, ...toPayload(values) };
        writeExtras(shopId, id, split(values));
        return toLocation(outlet, split(values));
      } catch (err) {
        if (isClientError(err)) {
          throw err;
        }
        writeExtras(shopId, id, split(values));
        return { id, ...values };
      }
    },
  };
}

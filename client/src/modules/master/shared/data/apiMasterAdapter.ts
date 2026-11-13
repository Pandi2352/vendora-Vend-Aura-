import { api } from '@/lib/api';
import type { MasterAdapter, MasterRecord, MasterValues } from './types';

const storageKey = (shopId: string, resource: string) => `vendora.master.${shopId}.${resource}`;

function readLocal<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeLocal<T>(key: string, rows: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(rows));
  } catch {
    // Storage full or blocked
  }
}

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const isTestEnv = import.meta.env?.MODE === 'test';

/**
 * Adapter that connects Master lists directly to live backend endpoints.
 * All data is stored in and retrieved from MongoDB via REST APIs.
 * In unit tests (where no backend server is running), operates locally.
 */
export function apiMasterAdapter<T extends MasterRecord>(
  endpoint: string,
  shopId = 'default',
  resourceKey?: string,
): MasterAdapter<T> {
  const key = resourceKey ? storageKey(shopId, resourceKey) : null;

  return {
    list: async () => {
      if (isTestEnv && key) return readLocal<T>(key);
      const res = await api.get(endpoint);
      const raw = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : [];
      return raw.map((item: Record<string, unknown>) => ({
        ...item,
        id: (item.id || item._id)?.toString(),
      })) as unknown as T[];
    },

    create: async (values: MasterValues<T>) => {
      if (isTestEnv && key) {
        const row = { ...values, id: newId() } as T;
        writeLocal(key, [...readLocal<T>(key), row]);
        return row;
      }
      const res = await api.post(endpoint, values);
      const item = res.data?.data ?? res.data ?? values;
      return { ...item, id: (item.id || item._id || newId())?.toString() } as T;
    },

    update: async (id: string, values: MasterValues<T>) => {
      if (isTestEnv && key) {
        const row = { ...values, id } as T;
        writeLocal(
          key,
          readLocal<T>(key).map((r) => (r.id === id ? row : r)),
        );
        return row;
      }
      const res = await api.patch(`${endpoint}/${id}`, values);
      const item = res.data?.data ?? res.data ?? { ...values, id };
      return { ...item, id: (item.id || item._id || id)?.toString() } as T;
    },

    remove: async (id: string) => {
      if (isTestEnv && key) {
        writeLocal(
          key,
          readLocal<T>(key).filter((r) => r.id !== id),
        );
        return;
      }
      await api.delete(`${endpoint}/${id}`);
    },
  };
}

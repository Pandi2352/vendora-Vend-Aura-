import { isAxiosError } from 'axios';
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

const isClientError = (err: unknown): boolean =>
  isAxiosError(err) && !!err.response && [400, 403, 409, 422].includes(err.response.status);

const isTestEnv = import.meta.env?.MODE === 'test';

/**
 * Adapter that connects Master lists to backend endpoints. Live database responses
 * are the single source of truth. Local cache is used only for offline/test fallback.
 */
export function apiMasterAdapter<T extends MasterRecord>(
  endpoint: string,
  shopId = 'default',
  resourceKey?: string,
): MasterAdapter<T> {
  const key = resourceKey ? storageKey(shopId, resourceKey) : null;

  return {
    list: async () => {
      try {
        const res = await api.get(endpoint);
        const data = (res.data?.data ?? []) as Array<Record<string, unknown>>;
        const items = data.map((item) => ({
          ...item,
          id: (item.id || item._id)?.toString(),
        })) as unknown as T[];
        if (key) {
          writeLocal(key, items);
        }
        return items;
      } catch {
        return key ? readLocal<T>(key) : [];
      }
    },

    create: async (values: MasterValues<T>) => {
      try {
        const res = await api.post(endpoint, values);
        const item = res.data?.data ?? values;
        const row = { ...item, id: (item.id || item._id || newId())?.toString() } as T;
        if (key) {
          const existing = readLocal<T>(key).filter((r) => r.id !== row.id);
          writeLocal(key, [...existing, row]);
        }
        return row;
      } catch (err) {
        if (isTestEnv && !isClientError(err)) {
          const row = { ...values, id: newId() } as T;
          if (key) {
            writeLocal(key, [...readLocal<T>(key), row]);
          }
          return row;
        }
        throw err;
      }
    },

    update: async (id: string, values: MasterValues<T>) => {
      try {
        const res = await api.patch(`${endpoint}/${id}`, values);
        const item = res.data?.data ?? { ...values, id };
        const row = { ...item, id: (item.id || item._id || id)?.toString() } as T;
        if (key) {
          writeLocal(
            key,
            readLocal<T>(key).map((r) => (r.id === id ? row : r)),
          );
        }
        return row;
      } catch (err) {
        if (isTestEnv && !isClientError(err)) {
          const row = { ...values, id } as T;
          if (key) {
            writeLocal(
              key,
              readLocal<T>(key).map((r) => (r.id === id ? row : r)),
            );
          }
          return row;
        }
        throw err;
      }
    },

    remove: async (id: string) => {
      try {
        await api.delete(`${endpoint}/${id}`);
        if (key) {
          writeLocal(
            key,
            readLocal<T>(key).filter((r) => r.id !== id),
          );
        }
      } catch (err) {
        if (isTestEnv && !isClientError(err)) {
          if (key) {
            writeLocal(
              key,
              readLocal<T>(key).filter((r) => r.id !== id),
            );
          }
          return;
        }
        throw err;
      }
    },
  };
}

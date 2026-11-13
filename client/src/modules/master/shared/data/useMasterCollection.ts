import { useCallback, useEffect, useMemo, useState } from 'react';
import { getErrorMessage } from '@/lib/api';
import type { MasterAdapter, MasterRecord, MasterValues } from './types';

/** Loads a Master list through its adapter and exposes save / remove that keep the list in sync. */
export function useMasterCollection<T extends MasterRecord>(adapter: MasterAdapter<T>) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await adapter.list());
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load this list.'));
    } finally {
      setLoading(false);
    }
  }, [adapter]);

  useEffect(() => {
    void reload();
  }, [reload]);

  /** Creates when `id` is missing, otherwise updates. Throws so the form can show the error. */
  const save = useCallback(
    async (values: MasterValues<T>, id?: string) => {
      const saved = id ? await adapter.update(id, values) : await adapter.create(values);
      setRows((list) => (id ? list.map((r) => (r.id === id ? saved : r)) : [...list, saved]));
      return saved;
    },
    [adapter],
  );

  const remove = useMemo(() => {
    const del = adapter.remove;
    if (!del) return undefined;
    return async (id: string) => {
      await del(id);
      setRows((list) => list.filter((r) => r.id !== id));
    };
  }, [adapter]);

  return { rows, loading, error, reload, save, remove };
}

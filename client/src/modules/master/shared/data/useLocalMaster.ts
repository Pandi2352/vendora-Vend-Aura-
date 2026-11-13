import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiMasterAdapter } from './apiMasterAdapter';
import type { MasterRecord } from './types';
import { useMasterCollection } from './useMasterCollection';

/** Master collection wired to server API with local cache synchronization. */
export function useLocalMaster<T extends MasterRecord>(resource: string) {
  const { user } = useAuth();
  const shopId = user?.shopId ?? 'unknown';
  const adapter = useMemo(
    () => apiMasterAdapter<T>(`/master/${resource}`, shopId, resource),
    [shopId, resource],
  );
  return useMasterCollection(adapter);
}


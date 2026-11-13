import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { localAdapter } from './localAdapter';
import type { MasterRecord } from './types';
import { useMasterCollection } from './useMasterCollection';

/** A Master list kept in this browser for the signed-in shop (see localAdapter). */
export function useLocalMaster<T extends MasterRecord>(resource: string) {
  const { user } = useAuth();
  const shopId = user?.shopId ?? 'unknown';
  const adapter = useMemo(() => localAdapter<T>(shopId, resource), [shopId, resource]);
  return useMasterCollection(adapter);
}

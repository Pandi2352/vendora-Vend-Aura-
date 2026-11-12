import { useState, useEffect, useCallback } from 'react';
import { getPendingOrdersCount, syncOfflineQueue } from './syncManager';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingOrdersCount();
      setPendingCount(count);
    } catch {
      // Ignore idb errors
    }
  }, []);

  const syncNow = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const result = await syncOfflineQueue();
      await refreshPendingCount();
      if (result.syncedCount > 0) {
        setSyncStatus(`Successfully synced ${result.syncedCount} offline bill(s) to cloud!`);
      } else if (result.errors.length > 0) {
        setSyncStatus(`Sync incomplete: ${result.errors[0]}`);
      }
    } catch {
      setSyncStatus('Failed to sync offline bills.');
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, refreshPendingCount]);

  useEffect(() => {
    refreshPendingCount();

    const handleOnline = () => {
      setIsOnline(true);
      // Auto-trigger sync when connectivity restores
      syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
      refreshPendingCount();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic check every 15s to update pending badge
    const interval = window.setInterval(refreshPendingCount, 15000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.clearInterval(interval);
    };
  }, [refreshPendingCount, syncNow]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    syncStatus,
    clearSyncStatus: () => setSyncStatus(null),
    syncNow,
    refreshPendingCount,
  };
}


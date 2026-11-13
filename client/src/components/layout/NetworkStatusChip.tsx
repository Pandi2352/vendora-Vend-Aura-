import { CloudCheck, CloudSlash, ArrowsClockwise } from '@phosphor-icons/react';
import { useNetworkStatus } from '../../lib/offline/useNetworkStatus';
import { cn } from '../ui/cn';

export function NetworkStatusChip() {
  const { isOnline, pendingCount, isSyncing, syncNow } = useNetworkStatus();

  if (isSyncing) {
    return (
      <div className="hidden sm:inline-flex items-center gap-1.5 h-9 px-2.5 rounded-md border border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold">
        <ArrowsClockwise className="w-3.5 h-3.5 animate-spin" />
        <span>Syncing offline bills…</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div
        className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-md border border-amber-200 bg-amber-50 text-amber-700 text-xs font-bold"
        title="Working offline. Orders are queued locally in IndexedDB."
      >
        <CloudSlash className="w-4 h-4 text-amber-600" />
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        <span>Offline {pendingCount > 0 ? `(${pendingCount})` : ''}</span>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <button
        type="button"
        onClick={syncNow}
        className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-md border border-amber-200 bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
        title="Click to sync offline bills to cloud now"
      >
        <ArrowsClockwise className="w-3.5 h-3.5" />
        <span>
          Sync {pendingCount} bill{pendingCount > 1 ? 's' : ''}
        </span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        'hidden lg:inline-flex items-center gap-1.5 h-9 px-2.5 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold select-none',
      )}
      title="Connected to Vendora Cloud"
    >
      <CloudCheck className="w-4 h-4 text-emerald-600" />
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      <span>Cloud Synced</span>
    </div>
  );
}

import { CloudCheck, CloudSlash, ArrowsClockwise } from '@phosphor-icons/react';
import { useNetworkStatus } from '../../lib/offline/useNetworkStatus';
import { cn } from '../ui/cn';

export function NetworkStatusChip() {
  const { isOnline, pendingCount, isSyncing, syncNow } = useNetworkStatus();

  if (isSyncing) {
    return (
      <div className="hidden sm:inline-flex items-center gap-1.5 h-9 px-2.5 rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-semibold">
        <ArrowsClockwise className="w-3.5 h-3.5 animate-spin" />
        <span>Syncing offline bills…</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div
        className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-md border border-amber-600/70 bg-amber-600/20 text-amber-300 text-xs font-bold"
        title="Working offline. Orders are queued locally in IndexedDB."
      >
        <CloudSlash className="w-4 h-4 text-amber-400" />
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span>Offline {pendingCount > 0 ? `(${pendingCount})` : ''}</span>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <button
        type="button"
        onClick={syncNow}
        className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-md border border-amber-500/60 bg-amber-500/20 text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition-colors cursor-pointer"
        title="Click to sync offline bills to cloud now"
      >
        <ArrowsClockwise className="w-3.5 h-3.5" />
        <span>Sync {pendingCount} bill{pendingCount > 1 ? 's' : ''}</span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        'hidden lg:inline-flex items-center gap-1.5 h-9 px-2.5 rounded-md border border-emerald-700/50 bg-emerald-700/10 text-emerald-300 text-xs font-semibold select-none',
      )}
      title="Connected to Vendora Cloud"
    >
      <CloudCheck className="w-4 h-4 text-emerald-400" />
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      <span>Cloud Synced</span>
    </div>
  );
}


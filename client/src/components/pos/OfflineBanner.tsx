import { CloudSlash, ArrowsClockwise, CheckCircle } from '@phosphor-icons/react';
import { useNetworkStatus } from '../../lib/offline/useNetworkStatus';
import { Button } from '../ui';

export function OfflineBanner() {
  const { isOnline, pendingCount, isSyncing, syncStatus, syncNow } = useNetworkStatus();

  if (syncStatus) {
    return (
      <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span className="font-medium">{syncStatus}</span>
        </div>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CloudSlash className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Offline Till Active:</strong> Internet disconnected. Bills will be stored securely on this computer and printed normally.
          </span>
        </div>
        {pendingCount > 0 && (
          <span className="font-mono font-bold px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-[11px]">
            {pendingCount} order{pendingCount > 1 ? 's' : ''} queued locally
          </span>
        )}
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ArrowsClockwise className="w-4 h-4 text-amber-600" />
          <span>
            Connected to cloud. <strong>{pendingCount}</strong> offline bill{pendingCount > 1 ? 's are' : ' is'} awaiting cloud sync.
          </span>
        </div>
        <Button size="sm" variant="primary" loading={isSyncing} onClick={syncNow}>
          Sync Now
        </Button>
      </div>
    );
  }

  return null;
}


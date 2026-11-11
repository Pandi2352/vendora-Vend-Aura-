import type { ReactNode } from 'react';

/** Label / value line used in detail cards (Terminal, Store profile). */
export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-zinc-100 last:border-b-0">
      <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-400 shrink-0">{label}</span>
      <span className="text-sm font-semibold text-zinc-900 text-right truncate">{value}</span>
    </div>
  );
}

import type { ReactNode } from 'react';
import { IconBadge } from './IconBadge';

interface StatTileProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: ReactNode;
}

export function StatTile({ label, value, hint, icon }: StatTileProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-md p-4 flex items-start gap-3">
      <IconBadge>{icon}</IconBadge>
      <div className="min-w-0">
        <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-zinc-400">{label}</p>
        <p className="text-xl font-extrabold text-zinc-900 mt-0.5 truncate">{value}</p>
        {hint && <p className="text-xs text-zinc-500 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

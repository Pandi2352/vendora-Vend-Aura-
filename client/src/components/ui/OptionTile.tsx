import type { ReactNode } from 'react';
import { cn } from './cn';

interface OptionTileProps {
  selected: boolean;
  onSelect: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
}

/** Selectable tile (theme, UI size, receipt width...). */
export function OptionTile({ selected, onSelect, title, subtitle, icon, className }: OptionTileProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'flex items-center gap-2 text-left rounded-md border px-3.5 py-2.5 transition-colors cursor-pointer',
        selected
          ? 'border-primary-600 bg-primary-600 text-white'
          : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300',
        className,
      )}
    >
      {icon && <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>}
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{title}</span>
        {subtitle && (
          <span className={cn('block text-[11px] mt-0.5', selected ? 'text-white/75' : 'text-zinc-400')}>{subtitle}</span>
        )}
      </span>
    </button>
  );
}

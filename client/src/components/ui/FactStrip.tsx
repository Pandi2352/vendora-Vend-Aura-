import type { ComponentType, ReactNode } from 'react';
import { Plus } from '@phosphor-icons/react';
import { cn } from './cn';

export type FactTone = 'blue' | 'emerald' | 'amber' | 'red';

/** Tinted tile + icon colour per tone (tones the dark theme remaps). */
const TILE_TONE: Record<FactTone, string> = {
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  amber: 'bg-amber-50 border-amber-200 text-amber-700',
  red: 'bg-red-50 border-red-200 text-red-700',
};
const EMPTY_TILE = 'bg-white border-dashed border-zinc-300 text-zinc-400';

export interface Fact {
  key: string;
  label: string;
  /** Phosphor icon (drawn duotone: tinted fill + outline) or any icon component. */
  icon: ComponentType<{ className?: string; weight?: 'duotone' }>;
  value?: ReactNode;
  tone?: FactTone;
}

interface FactStripProps {
  facts: Fact[];
  /** Makes each fact a button, e.g. to jump to the field that edits it. */
  onSelect?: (key: string) => void;
  className?: string;
}

const isEmpty = (value: ReactNode) => value === undefined || value === null || value === '' || value === '-';

/**
 * Key facts in one segmented strip (label over value, divided cells).
 * Missing values read "Add"; with onSelect each cell opens its field.
 */
export function FactStrip({ facts, onSelect, className }: FactStripProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-stretch rounded-md border border-zinc-200 bg-zinc-50 overflow-hidden',
        className,
      )}
    >
      {facts.map(({ key, label, icon: Icon, value, tone = 'blue' }) => {
        const empty = isEmpty(value);
        const body = (
          <>
            <span
              className={cn(
                'w-7 h-7 rounded-md border inline-flex items-center justify-center shrink-0',
                empty ? EMPTY_TILE : TILE_TONE[tone],
              )}
            >
              <Icon weight="duotone" className="w-4 h-4" />
            </span>
            <span className="flex flex-col min-w-0 leading-tight text-left">
              <span className="text-[0.625rem] font-bold uppercase tracking-wide text-zinc-500">{label}</span>
              <span className="text-xs truncate">
                {empty ? (
                  <span className="inline-flex items-center gap-0.5 font-semibold text-primary-600">
                    <Plus weight="bold" className="w-2.5 h-2.5" />
                    Add
                  </span>
                ) : (
                  <span className="font-semibold text-zinc-900">{value}</span>
                )}
              </span>
            </span>
          </>
        );
        const cell = 'flex items-center gap-2 px-2.5 py-1.5 min-w-0 border-r border-zinc-200 last:border-r-0';
        return onSelect ? (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            aria-label={`${label}: ${empty ? 'not set, add' : 'edit'}`}
            className={cn(
              cell,
              'cursor-pointer transition-colors hover:bg-white focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-500',
            )}
          >
            {body}
          </button>
        ) : (
          <div key={key} className={cell}>
            {body}
          </div>
        );
      })}
    </div>
  );
}

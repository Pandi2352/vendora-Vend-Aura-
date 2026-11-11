import type { ReactNode } from 'react';
import { cn } from '../ui/cn';

export interface RowAction {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  href?: string;
  tone?: 'neutral' | 'primary' | 'success' | 'danger' | 'warning';
  disabled?: boolean;
}

const TONES = {
  neutral: 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100',
  primary: 'bg-primary-50 border-primary-200 text-primary-700 hover:bg-primary-100',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100',
  danger: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100',
  warning: 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100',
} as const;

/** Small tinted square icon buttons for a table row (view, edit, delete…). `label` is the accessible name. */
export function RowActions({ actions }: { actions: RowAction[] }) {
  return (
    <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {actions.map((a) => {
        const className = cn(
          'inline-flex items-center justify-center w-8 h-8 rounded-md border transition-colors [&>svg]:w-4 [&>svg]:h-4',
          TONES[a.tone ?? 'neutral'],
          a.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        );
        return a.href ? (
          <a key={a.label} href={a.href} target="_blank" rel="noreferrer" aria-label={a.label} title={a.label} className={className}>
            {a.icon}
          </a>
        ) : (
          <button key={a.label} type="button" aria-label={a.label} title={a.label} onClick={a.onClick} disabled={a.disabled} className={className}>
            {a.icon}
          </button>
        );
      })}
    </div>
  );
}

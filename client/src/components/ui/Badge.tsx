import type { ReactNode } from 'react';
import { cn } from './cn';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-zinc-100 border-zinc-200 text-zinc-700',
  primary: 'bg-primary-50 border-primary-200 text-primary-700',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  danger: 'bg-red-50 border-red-200 text-red-700',
  info: 'bg-blue-50 border-blue-200 text-blue-700',
};

interface BadgeProps {
  tone?: BadgeTone;
  /** Leading dot so status is not conveyed by colour alone. */
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = 'neutral', dot, children, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[0.6875rem] font-bold', TONES[tone], className)}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

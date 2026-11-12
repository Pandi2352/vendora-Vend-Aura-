import type { ReactNode } from 'react';
import { cn } from '../cn';

const TONES = {
  rail: { on: 'bg-primary-50 text-primary-700', off: 'bg-zinc-100 text-zinc-500' },
  segmented: { on: 'bg-primary-100 text-primary-700', off: 'bg-zinc-100 text-zinc-600' },
};

/** Count / tag shown after a tab label. */
export function TabBadge({
  children,
  active,
  tone = 'rail',
}: {
  children: ReactNode;
  active: boolean;
  tone?: keyof typeof TONES;
}) {
  return (
    <span
      className={cn(
        'min-w-5 h-5 px-1.5 rounded-md text-[0.6875rem] font-bold tabular-nums inline-flex items-center justify-center transition-colors',
        active ? TONES[tone].on : TONES[tone].off,
      )}
    >
      {children}
    </span>
  );
}

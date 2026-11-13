import type { ReactNode } from 'react';
import { cn } from '../cn';
import { isApplePlatform } from './command-utils';

/** Small key cap, e.g. <Kbd>Esc</Kbd>. */
export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center h-5 px-1.5 rounded-md border border-zinc-200 bg-zinc-50 font-sans text-[0.6875rem] font-semibold text-zinc-500',
        className,
      )}
    >
      {children}
    </kbd>
  );
}

/** "Ctrl K" (or "⌘ K" on Apple devices): the command palette hotkey hint. */
export function CommandHotkeyHint({ className }: { className?: string }) {
  return <Kbd className={className}>{isApplePlatform() ? '⌘' : 'Ctrl'} K</Kbd>;
}

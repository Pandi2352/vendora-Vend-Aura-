import type { ReactNode } from 'react';
import { cn } from './cn';

/** Small tinted square that holds an icon (card headers, stat tiles). */
export function IconBadge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-8 h-8 rounded-md bg-primary-50 text-primary-600 shrink-0 [&>svg]:w-[1.125rem] [&>svg]:h-[1.125rem]',
        className,
      )}
    >
      {children}
    </span>
  );
}

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../ui/cn';

interface TopbarIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
}

/** Square icon button for the dark top bar. `label` is the accessible name and tooltip. */
export function TopbarIconButton({ label, children, className, ...rest }: TopbarIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center w-9 h-9 rounded-md text-shell-text hover:bg-shell-hover transition-colors cursor-pointer [&>svg]:w-[18px] [&>svg]:h-[18px]',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

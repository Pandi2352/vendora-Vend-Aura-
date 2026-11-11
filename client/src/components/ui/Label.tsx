import type { LabelHTMLAttributes } from 'react';
import { cn } from './cn';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

/** Field label; `required` adds a red asterisk (hidden from screen readers, which get aria-required). */
export function Label({ required, className, children, ...rest }: LabelProps) {
  return (
    <label className={cn('block text-xs font-semibold text-zinc-700 mb-1.5', className)} {...rest}>
      {children}
      {required && (
        <span className="text-red-600 ml-0.5" aria-hidden>
          *
        </span>
      )}
    </label>
  );
}

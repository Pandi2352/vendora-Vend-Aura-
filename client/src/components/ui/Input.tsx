import type { InputHTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from './cn';
import { addonClass, controlClass, controlShellClass } from './field-styles';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  /** Fixed text/icon before the value, e.g. "₹" or "+91". */
  leftAddon?: ReactNode;
  /** Element after the value, e.g. a show-password button. */
  rightAddon?: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

/** Text input. Same height and states as every other control (see field-styles). */
export function Input({ invalid, leftAddon, rightAddon, className, disabled, ref, ...rest }: InputProps) {
  if (!leftAddon && !rightAddon) {
    return (
      <input
        ref={ref}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={controlClass(invalid, className)}
        {...rest}
      />
    );
  }

  return (
    <div className={controlShellClass(invalid, disabled)}>
      {leftAddon && <span className={cn(addonClass, 'border-r border-zinc-200')}>{leftAddon}</span>}
      <input
        ref={ref}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={cn(
          'flex-1 min-w-0 px-3 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 outline-none disabled:cursor-not-allowed disabled:text-zinc-400',
          className,
        )}
        {...rest}
      />
      {rightAddon && <span className="flex items-center pr-1.5 shrink-0">{rightAddon}</span>}
    </div>
  );
}

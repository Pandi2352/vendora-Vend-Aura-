import type { InputHTMLAttributes, ReactNode, Ref } from 'react';
import { Check } from '@phosphor-icons/react';
import { cn } from './cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  description?: ReactNode;
  invalid?: boolean;
  ref?: Ref<HTMLInputElement>;
}

/** Native checkbox (keyboard + form friendly) with a custom square look. */
export function Checkbox({ label, description, invalid, className, disabled, id, ref, ...rest }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn('inline-flex items-start gap-2.5 select-none', disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer', className)}
    >
      <span className="relative inline-flex shrink-0 mt-0.5">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          disabled={disabled}
          aria-invalid={invalid || undefined}
          className={cn(
            'peer appearance-none w-[1.125rem] h-[1.125rem] rounded-md border bg-white transition-colors cursor-[inherit]',
            'checked:bg-primary-600 checked:border-primary-600',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600',
            invalid ? 'border-red-500' : 'border-zinc-300',
          )}
          {...rest}
        />
        <Check
          aria-hidden
          weight="bold"
          className="pointer-events-none absolute inset-0 m-auto w-3 h-3 text-white opacity-0 peer-checked:opacity-100"
        />
      </span>
      {(label || description) && (
        <span className="min-w-0">
          {label && <span className="block text-sm font-medium text-zinc-800">{label}</span>}
          {description && <span className="block text-xs text-zinc-500 mt-0.5">{description}</span>}
        </span>
      )}
    </label>
  );
}

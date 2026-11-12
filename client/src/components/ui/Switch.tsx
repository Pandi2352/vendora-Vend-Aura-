import type { Ref } from 'react';
import { Check } from '@phosphor-icons/react';
import { cn } from './cn';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  onBlur?: () => void;
  disabled?: boolean;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * On/off switch (role="switch"); Space / Enter toggle. Sized in rem so it
 * follows the UI size setting. The knob shows a check mark when on.
 */
export function Switch({ checked, onChange, onBlur, disabled, id, ref, ...aria }: SwitchProps) {
  return (
    <button
      ref={ref}
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      onBlur={onBlur}
      className={cn(
        'group relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border p-0.5 transition-colors cursor-pointer',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        checked ? 'bg-primary-600 border-primary-600' : 'bg-zinc-200 border-zinc-300 hover:bg-zinc-300',
      )}
      {...aria}
    >
      <span
        className={cn(
          'inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white transition-transform duration-200 ease-out motion-reduce:transition-none',
          checked ? 'translate-x-4' : 'translate-x-0',
        )}
      >
        <Check
          weight="bold"
          aria-hidden
          className={cn('h-2.5 w-2.5 text-primary-600 transition-opacity', checked ? 'opacity-100' : 'opacity-0')}
        />
      </span>
    </button>
  );
}

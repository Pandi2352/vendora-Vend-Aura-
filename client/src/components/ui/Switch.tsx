import type { Ref } from 'react';
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

/** On/off switch (role="switch"); Space / Enter toggle. */
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
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors cursor-pointer',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        checked ? 'bg-primary-600 border-primary-600' : 'bg-zinc-200 border-zinc-300',
      )}
      {...aria}
    >
      <span
        className={cn(
          'inline-block h-[18px] w-[18px] rounded-full bg-white transition-transform motion-reduce:transition-none',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}

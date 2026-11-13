import { useId } from 'react';
import { cn } from './cn';

export interface RadioOption<V extends string = string> {
  value: V;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps<V extends string> {
  name?: string;
  options: RadioOption<V>[];
  value: V | null | undefined;
  onChange: (value: V) => void;
  onBlur?: () => void;
  invalid?: boolean;
  disabled?: boolean;
  /** Row of options instead of a stacked list. */
  inline?: boolean;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

/** Native radios (arrow-key navigation built in) with a custom round look. */
export function RadioGroup<V extends string>({
  name,
  options,
  value,
  onChange,
  onBlur,
  invalid,
  disabled,
  inline,
  ...aria
}: RadioGroupProps<V>) {
  const autoName = useId();
  const groupName = name ?? autoName;

  return (
    <div
      role="radiogroup"
      aria-invalid={invalid || undefined}
      className={cn('flex gap-x-5 gap-y-2.5', inline ? 'flex-row flex-wrap' : 'flex-col')}
      {...aria}
    >
      {options.map((option) => {
        const isDisabled = disabled || option.disabled;
        return (
          <label
            key={option.value}
            className={cn('inline-flex items-start gap-2.5 select-none', isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer')}
          >
            <input
              type="radio"
              name={groupName}
              value={option.value}
              checked={value === option.value}
              disabled={isDisabled}
              onChange={() => onChange(option.value)}
              onBlur={onBlur}
              className={cn(
                'appearance-none mt-0.5 w-[1.125rem] h-[1.125rem] shrink-0 rounded-full border bg-white transition-colors cursor-[inherit]',
                'checked:border-[5px] checked:border-primary-600',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600',
                invalid ? 'border-red-500' : 'border-zinc-300',
              )}
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-zinc-800">{option.label}</span>
              {option.description && <span className="block text-xs text-zinc-500 mt-0.5">{option.description}</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
}

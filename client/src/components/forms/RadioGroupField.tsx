import { useId } from 'react';
import { RadioGroup, type RadioOption } from '../ui/RadioGroup';
import { cn } from '../ui/cn';
import { FormField } from './FormField';
import { useFieldBinding } from './useFormFieldController';
import { splitFieldProps, type FieldCommonProps } from './types';

export interface RadioGroupFieldProps<V extends string> extends FieldCommonProps {
  options: RadioOption<V>[];
  /** stacked (default) · inline · cards (bordered tiles with descriptions) · segmented (button bar, h-10). */
  variant?: 'stacked' | 'inline' | 'cards' | 'segmented';
  /** @deprecated use variant="inline" */
  inline?: boolean;
  onValueChange?: (value: V) => void;
}

/** One choice from a few visible options. Arrow keys move between options (native radios). */
export function RadioGroupField<V extends string>(props: RadioGroupFieldProps<V>) {
  const [common, own] = splitFieldProps(props);
  const { options, inline, onValueChange } = own;
  const variant = own.variant ?? (inline ? 'inline' : 'stacked');
  const { field, invalid, disabled, readOnly, shell, ids } = useFieldBinding(common);
  const labelId = useId();
  const groupName = `${field.name}-${labelId}`;

  const change = (value: V) => {
    if (readOnly) return;
    field.onChange(value);
    onValueChange?.(value);
  };

  if (variant === 'stacked' || variant === 'inline') {
    return (
      <FormField {...shell} labelAsText labelId={labelId}>
        <RadioGroup<V>
          name={groupName}
          options={options}
          value={field.value as V | null}
          onChange={change}
          onBlur={field.onBlur}
          disabled={disabled}
          invalid={invalid}
          inline={variant === 'inline'}
          aria-labelledby={common.label ? labelId : undefined}
          aria-describedby={ids.describedBy}
        />
      </FormField>
    );
  }

  const segmented = variant === 'segmented';
  return (
    <FormField {...shell} labelAsText labelId={labelId}>
      <div
        role="radiogroup"
        aria-labelledby={common.label ? labelId : undefined}
        aria-describedby={ids.describedBy}
        aria-invalid={invalid || undefined}
        className={cn(
          segmented ? 'inline-flex w-full h-10 p-1 gap-1 rounded-md border bg-zinc-100' : 'grid gap-2 sm:grid-cols-2',
          segmented && (invalid ? 'border-red-500' : 'border-zinc-200'),
        )}
      >
        {options.map((option, index) => {
          const checked = field.value === option.value;
          const isDisabled = disabled || option.disabled;
          return (
            <label
              key={option.value}
              className={cn(
                'relative flex cursor-pointer select-none rounded-md border transition-colors',
                'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-primary-600',
                segmented
                  ? 'flex-1 items-center justify-center px-3 text-sm font-semibold'
                  : 'flex-col gap-0.5 px-3.5 py-2.5',
                checked
                  ? segmented
                    ? 'bg-white border-zinc-200 text-primary-700'
                    : 'border-primary-600 bg-primary-50'
                  : segmented
                    ? 'border-transparent text-zinc-600 hover:text-zinc-900'
                    : cn('bg-white hover:border-zinc-400', invalid ? 'border-red-500' : 'border-zinc-200'),
                isDisabled && 'opacity-50 cursor-not-allowed',
              )}
            >
              <input
                ref={index === 0 ? field.ref : undefined}
                type="radio"
                name={groupName}
                value={option.value}
                checked={checked}
                disabled={isDisabled}
                onChange={() => change(option.value)}
                onBlur={field.onBlur}
                className="sr-only"
              />
              <span className={cn(!segmented && 'text-sm font-semibold text-zinc-900')}>{option.label}</span>
              {!segmented && option.description && <span className="text-xs text-zinc-500">{option.description}</span>}
            </label>
          );
        })}
      </div>
    </FormField>
  );
}

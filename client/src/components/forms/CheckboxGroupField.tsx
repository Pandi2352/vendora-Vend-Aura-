import { useEffect, useRef, type FocusEvent, type ReactNode } from 'react';
import { Check, Minus } from '@phosphor-icons/react';
import { Checkbox } from '../ui/Checkbox';
import { cn } from '../ui/cn';
import { FormField } from './FormField';
import type { FieldCommonProps } from './types';
import { useFieldBinding } from './useFormFieldController';

type OptionValue = string | number;

export interface CheckboxGroupOption<V extends OptionValue = string> {
  value: V;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface CheckboxGroupFieldProps<V extends OptionValue = string> extends FieldCommonProps {
  options: CheckboxGroupOption<V>[];
  /** Boxes in a wrapping row instead of a column. */
  inline?: boolean;
  /** Shown in the default hint; enforce with checkboxGroupRule(label, { min }). */
  min?: number;
  /** Unchecked boxes are disabled once this many are chosen. */
  max?: number;
  /** "Select all" box with a mixed state (ignored when max is set). */
  showSelectAll?: boolean;
  selectAllLabel?: string;
}

function defaultHint(min?: number, max?: number) {
  if (min && max) return min === max ? `Choose ${min}.` : `Choose ${min} to ${max}.`;
  if (min) return `Choose at least ${min}.`;
  if (max) return `Choose up to ${max}.`;
  return undefined;
}

/** Several checkboxes writing one array of option values (kept in option order). */
export function CheckboxGroupField<V extends OptionValue = string>({
  options,
  inline,
  min,
  max,
  showSelectAll,
  selectAllLabel = 'Select all',
  autoFocus,
  ...props
}: CheckboxGroupFieldProps<V>) {
  const { field, invalid, ids, disabled, readOnly, shell, a11y } = useFieldBinding({ ...props, hint: props.hint ?? defaultHint(min, max) });
  const labelId = `${ids.id}-label`;
  const selected = Array.isArray(field.value) ? (field.value as V[]) : [];
  const atMax = max !== undefined && selected.length >= max;
  const locked = disabled || readOnly;

  const enabled = options.filter((o) => !o.disabled);
  const allChecked = enabled.length > 0 && enabled.every((o) => selected.includes(o.value));
  const someChecked = !allChecked && enabled.some((o) => selected.includes(o.value));

  const emit = (next: V[]) => field.onChange(options.map((o) => o.value).filter((v) => next.includes(v)));

  const toggle = (value: V, checked: boolean) => {
    if (locked) return;
    emit(checked ? [...selected, value] : selected.filter((v) => v !== value));
  };

  const toggleAll = () => {
    if (locked) return;
    const enabledValues = enabled.map((o) => o.value);
    emit(allChecked ? selected.filter((v) => !enabledValues.includes(v)) : [...selected, ...enabledValues]);
  };

  const onGroupBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) field.onBlur();
  };

  return (
    <FormField {...shell} labelAsText labelId={labelId}>
      <div
        role="group"
        aria-labelledby={props.label ? labelId : undefined}
        aria-describedby={a11y['aria-describedby']}
        onBlur={onGroupBlur}
        className="flex flex-col gap-2.5"
      >
        {showSelectAll && max === undefined && (
          <SelectAllBox
            id={`${ids.id}-all`}
            label={selectAllLabel}
            checked={allChecked}
            mixed={someChecked}
            disabled={disabled || enabled.length === 0}
            readOnly={readOnly}
            onToggle={toggleAll}
          />
        )}
        <div className={cn(inline ? 'flex flex-wrap gap-x-6 gap-y-2.5' : 'flex flex-col gap-2.5', showSelectAll && max === undefined && 'pl-6')}>
          {options.map((option, i) => {
            const checked = selected.includes(option.value);
            return (
              <Checkbox
                key={String(option.value)}
                ref={i === 0 ? field.ref : undefined}
                id={i === 0 ? a11y.id : `${ids.id}-${i}`}
                name={field.name}
                value={String(option.value)}
                label={option.label}
                description={option.description}
                checked={checked}
                disabled={disabled || option.disabled || (atMax && !checked)}
                aria-readonly={readOnly || undefined}
                autoFocus={autoFocus && i === 0}
                invalid={invalid}
                onChange={(e) => toggle(option.value, e.target.checked)}
              />
            );
          })}
        </div>
      </div>
    </FormField>
  );
}

interface SelectAllBoxProps {
  id: string;
  label: string;
  checked: boolean;
  mixed: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  onToggle: () => void;
}

/** Checkbox with a native indeterminate state (announced as "mixed"). */
function SelectAllBox({ id, label, checked, mixed, disabled, readOnly, onToggle }: SelectAllBoxProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = mixed;
  }, [mixed]);

  return (
    <label htmlFor={id} className={cn('inline-flex items-center gap-2.5 select-none', disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer')}>
      <span className="relative inline-flex shrink-0">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          aria-readonly={readOnly || undefined}
          onChange={onToggle}
          className={cn(
            'peer appearance-none w-[18px] h-[18px] rounded-md border bg-white transition-colors cursor-[inherit]',
            'checked:bg-primary-600 checked:border-primary-600 indeterminate:bg-primary-600 indeterminate:border-primary-600',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 border-zinc-300',
          )}
        />
        <Check aria-hidden weight="bold" className="pointer-events-none absolute inset-0 m-auto w-3 h-3 text-white opacity-0 peer-checked:opacity-100" />
        <Minus aria-hidden weight="bold" className="pointer-events-none absolute inset-0 m-auto w-3 h-3 text-white opacity-0 peer-indeterminate:opacity-100" />
      </span>
      <span className="text-sm font-medium text-zinc-800">{label}</span>
    </label>
  );
}

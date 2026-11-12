import { useState } from 'react';
import { CalendarBlank } from '@phosphor-icons/react';
import { cn } from '../../ui/cn';
import { controlClass } from '../../ui/field-styles';
import { Popover } from '../../ui/overlay/Popover';
import { useNestedListGuard } from '../../ui/calendar/useNestedListGuard';
import { isoToDmy, parseIsoDate, toIsoDate, type WeekDay } from '../../ui/calendar/calendar-utils';
import { FormField } from '../FormField';
import { useFieldBinding } from '../useFormFieldController';
import type { FieldCommonProps } from '../types';
import { RangePanel } from './RangePanel';

export interface DateRangeValue {
  start: string | null;
  end: string | null;
}

export interface DateRangeFieldProps extends FieldCommonProps {
  /** Earliest / latest allowed day, 'YYYY-MM-DD'. */
  min?: string;
  max?: string;
  isDateDisabled?: (date: Date) => boolean;
  placeholder?: string;
  /** Quick ranges column (Today, Last 7 days, This financial year…). Default true. */
  presets?: boolean;
  weekStartsOn?: WeekDay;
}

/**
 * Start / end dates in one trigger ("01/11/2026 – 30/11/2026"). The popover
 * holds a draft; the form value `{ start, end }` ('YYYY-MM-DD') changes on Apply.
 */
export function DateRangeField(props: DateRangeFieldProps) {
  const { min, max, isDateDisabled, placeholder = 'Select dates', presets = true, weekStartsOn = 1, autoFocus } = props;
  const { field, invalid, disabled, readOnly, shell, a11y, ids } = useFieldBinding(props);
  const [open, setOpen] = useState(false);
  useNestedListGuard(open);

  const value = (field.value as DateRangeValue | null) ?? { start: null, end: null };
  const start = isoToDmy(value.start);
  const end = isoToDmy(value.end);
  const display = start ? `${start} – ${end || start}` : '';
  const labelId = `${ids.id}-label`;
  const textId = `${ids.id}-text`;

  return (
    <FormField {...shell} labelId={labelId}>
      <Popover
        label={typeof props.label === 'string' ? `Choose ${props.label.toLowerCase()}` : 'Choose dates'}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) field.onBlur();
        }}
        trigger={(triggerProps) => (
          <button
            {...triggerProps}
            {...a11y}
            ref={(node) => {
              triggerProps.ref.current = node;
              field.ref(node);
            }}
            name={field.name}
            type="button"
            disabled={disabled}
            // Forwards the caller's explicit autoFocus opt-in.
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={autoFocus}
            // aria-readonly is not valid on a button; read-only triggers use aria-disabled (same as FileDropzone).
            aria-disabled={readOnly || undefined}
            aria-labelledby={props.label ? `${labelId} ${textId}` : textId}
            onClick={readOnly ? undefined : triggerProps.onClick}
            onBlur={() => {
              if (!open) field.onBlur();
            }}
            className={controlClass(
              invalid,
              cn('flex items-center gap-2 text-left tabular-nums', readOnly ? 'cursor-default bg-zinc-50' : 'cursor-pointer'),
            )}
          >
            <CalendarBlank aria-hidden className="w-4 h-4 shrink-0 text-zinc-500" />
            <span id={textId} className={cn('flex-1 truncate', !display && 'text-zinc-400')}>
              {display || placeholder}
            </span>
          </button>
        )}
      >
        {(close) => (
          <RangePanel
            initial={{ start: parseIsoDate(value.start), end: parseIsoDate(value.end) }}
            min={parseIsoDate(min)}
            max={parseIsoDate(max)}
            isDateDisabled={isDateDisabled}
            weekStartsOn={weekStartsOn}
            showPresets={presets}
            onCancel={close}
            onApply={(range) => {
              field.onChange({ start: toIsoDate(range.start), end: toIsoDate(range.end) });
              close();
            }}
          />
        )}
      </Popover>
    </FormField>
  );
}

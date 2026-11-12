import { useRef, useState } from 'react';
import { CalendarBlank, X } from '@phosphor-icons/react';
import { Input } from '../../ui/Input';
import { Popover } from '../../ui/overlay/Popover';
import { Calendar } from '../../ui/calendar/Calendar';
import { useNestedListGuard } from '../../ui/calendar/useNestedListGuard';
import { formatDmy, isoToDmy, maskDmy, parseDmy, parseIsoDate, toIsoDate, type WeekDay } from '../../ui/calendar/calendar-utils';
import { FormField } from '../FormField';
import { useFieldBinding } from '../useFormFieldController';
import type { FieldCommonProps } from '../types';
import { DATE_FORMAT_MESSAGE } from '@/validations/dates';
import { useSyncedText } from './useSyncedText';

export interface DateFieldProps extends FieldCommonProps {
  /** Earliest / latest allowed day, 'YYYY-MM-DD'. Days outside are disabled in the calendar. */
  min?: string;
  max?: string;
  isDateDisabled?: (date: Date) => boolean;
  placeholder?: string;
  /** × button to empty the field. */
  clearable?: boolean;
  /** "Today" button in the calendar. */
  showToday?: boolean;
  weekStartsOn?: WeekDay;
}

const addonButtonClass =
  'inline-flex items-center justify-center w-8 h-8 rounded-md text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-primary-600 disabled:cursor-not-allowed disabled:text-zinc-300 disabled:hover:bg-transparent';

/**
 * Date typed as dd/mm/yyyy (digits only, slashes added) or picked from a
 * calendar popover. The form value is 'YYYY-MM-DD' or null; while the typed
 * text is not a real date the value is that text, so the schema blocks submit.
 */
export function DateField(props: DateFieldProps) {
  const { min, max, isDateDisabled, placeholder = 'dd/mm/yyyy', clearable = false, showToday = false, weekStartsOn = 1, autoFocus } = props;
  const [typedError, setTypedError] = useState<string>();
  const { field, invalid, disabled, readOnly, shell, a11y } = useFieldBinding({ ...props, error: props.error ?? typedError });
  const { text, setText, emit } = useSyncedText(field.value, field.onChange, (v) => isoToDmy(v as string), () => setTypedError(undefined));
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  useNestedListGuard(open);

  const minDate = parseIsoDate(min);
  const maxDate = parseIsoDate(max);
  const selected = parseIsoDate(field.value as string | null) ?? parseDmy(text);
  const locked = disabled || readOnly;

  const onTextChange = (raw: string) => {
    const next = maskDmy(raw);
    setText(next);
    setTypedError(undefined);
    const d = parseDmy(next);
    emit(next === '' ? null : d ? toIsoDate(d) : next);
  };

  const commitText = () => {
    if (!text) return;
    const d = parseDmy(text);
    if (d) setText(formatDmy(d));
    else setTypedError(DATE_FORMAT_MESSAGE);
  };

  const pick = (d: Date) => {
    setText(formatDmy(d));
    setTypedError(undefined);
    emit(toIsoDate(d));
  };

  const calendarButton = (
    <Popover
      label={typeof props.label === 'string' ? `Choose ${props.label.toLowerCase()}` : 'Choose date'}
      placement="bottom-end"
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) field.onBlur();
      }}
      trigger={(triggerProps) => (
        <button
          {...triggerProps}
          ref={(node) => {
            triggerProps.ref.current = node;
            buttonRef.current = node;
          }}
          type="button"
          disabled={locked}
          onBlur={(e) => {
            // Leaving the field via its calendar button also counts as "touched" (unless going back to the input).
            if (!open && e.relatedTarget?.id !== a11y.id) field.onBlur();
          }}
          aria-label={selected ? `Change date, ${formatDmy(selected)}` : 'Choose date'}
          className={addonButtonClass}
        >
          <CalendarBlank className="w-4 h-4" />
        </button>
      )}
    >
      {(close) => (
        <Calendar
          value={selected}
          min={minDate}
          max={maxDate}
          isDateDisabled={isDateDisabled}
          weekStartsOn={weekStartsOn}
          showToday={showToday}
          autoFocus
          onSelect={(d) => {
            pick(d);
            close();
          }}
        />
      )}
    </Popover>
  );

  return (
    <FormField {...shell}>
      <Input
        {...a11y}
        ref={field.ref}
        name={field.name}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        maxLength={10}
        placeholder={placeholder}
        autoFocus={autoFocus}
        value={text}
        disabled={disabled}
        readOnly={readOnly}
        invalid={invalid}
        className="tabular-nums"
        onChange={(e) => onTextChange(e.target.value)}
        onBlur={(e) => {
          commitText();
          // Moving to the calendar button is still "inside" the field.
          if (e.relatedTarget !== buttonRef.current) field.onBlur();
        }}
        rightAddon={
          <span className="flex items-center gap-0.5">
            {clearable && text && !locked && (
              <button
                type="button"
                aria-label="Clear date"
                className={addonButtonClass}
                onClick={() => {
                  setText('');
                  setTypedError(undefined);
                  emit(null);
                  document.getElementById(a11y.id)?.focus();
                }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {calendarButton}
          </span>
        }
      />
    </FormField>
  );
}

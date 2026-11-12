import { useState, type KeyboardEvent } from 'react';
import { Clock } from '@phosphor-icons/react';
import { Input } from '../../ui/Input';
import { formatTimeValue, HH_MM, maskTime, parseTime, stepTime } from '../../ui/calendar/time-utils';
import { FormField } from '../FormField';
import { useFieldBinding } from '../useFormFieldController';
import type { FieldCommonProps } from '../types';
import { TIME_FORMAT_MESSAGE } from '@/validations/dates';
import { useSyncedText } from './useSyncedText';

const TIME_FORMAT_MESSAGE_12H = 'Enter a time like 2:30 pm';

export interface TimeFieldProps extends FieldCommonProps {
  /** Show "2:30 pm" instead of "14:30" (the value stays 'HH:mm'). */
  hour12?: boolean;
  /** Minutes added / removed by ↑ / ↓. Default 15. */
  step?: number;
  placeholder?: string;
}

const nowValue = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/**
 * Time typed as hh:mm (24h, colon added automatically) or "2:30 pm" with
 * `hour12`. ↑ / ↓ step by `step` minutes. The form value is 'HH:mm' or null;
 * text that is not a time stays as the value so the schema blocks submit.
 */
export function TimeField(props: TimeFieldProps) {
  const { hour12 = false, step = 15, placeholder = hour12 ? 'hh:mm am' : 'hh:mm', autoFocus } = props;
  const [typedError, setTypedError] = useState<string>();
  const { field, invalid, disabled, readOnly, shell, a11y } = useFieldBinding({ ...props, error: props.error ?? typedError });
  const format = (v: unknown) => (typeof v === 'string' && HH_MM.test(v) ? formatTimeValue(v, hour12) : '');
  const { text, setText, emit } = useSyncedText(field.value, field.onChange, format, () => setTypedError(undefined));

  const onTextChange = (raw: string) => {
    const next = maskTime(raw, hour12);
    setText(next);
    setTypedError(undefined);
    emit(next.trim() === '' ? null : (parseTime(next) ?? next));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key !== 'ArrowUp' && e.key !== 'ArrowDown') || readOnly || disabled) return;
    e.preventDefault();
    const next = stepTime(parseTime(text) ?? nowValue(), step, e.key === 'ArrowUp' ? 1 : -1);
    setText(formatTimeValue(next, hour12));
    setTypedError(undefined);
    emit(next);
  };

  const commitText = () => {
    if (!text.trim()) return;
    const parsed = parseTime(text);
    if (parsed) {
      setText(formatTimeValue(parsed, hour12));
      emit(parsed);
    } else setTypedError(hour12 ? TIME_FORMAT_MESSAGE_12H : TIME_FORMAT_MESSAGE);
  };

  return (
    <FormField {...shell}>
      <Input
        {...a11y}
        ref={field.ref}
        name={field.name}
        type="text"
        inputMode={hour12 ? 'text' : 'numeric'}
        autoComplete="off"
        maxLength={hour12 ? 8 : 5}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-keyshortcuts="ArrowUp ArrowDown"
        value={text}
        disabled={disabled}
        readOnly={readOnly}
        invalid={invalid}
        className="tabular-nums"
        onChange={(e) => onTextChange(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => {
          commitText();
          field.onBlur();
        }}
        rightAddon={<Clock aria-hidden className="w-4 h-4 mr-1.5 text-zinc-400" />}
      />
    </FormField>
  );
}

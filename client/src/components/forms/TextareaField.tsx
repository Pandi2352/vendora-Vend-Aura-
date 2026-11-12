import { useLayoutEffect, useRef } from 'react';
import { Textarea } from '../ui/Textarea';
import { FormField } from './FormField';
import { useFieldBinding } from './useFormFieldController';
import { splitFieldProps, type FieldCommonProps } from './types';

export interface TextareaFieldProps extends FieldCommonProps {
  placeholder?: string;
  rows?: number;
  /** Grow with the content up to `maxRows`. */
  autoResize?: boolean;
  maxRows?: number;
  maxLength?: number;
  /** "120/500" counter (default on when maxLength is set). */
  showCount?: boolean;
}

const LINE_HEIGHT_PX = 20;

/** Multi-line text with optional auto-resize and character counter. */
export function TextareaField(props: TextareaFieldProps) {
  const [common, own] = splitFieldProps(props);
  const { placeholder, rows = 3, autoResize = false, maxRows = 10, maxLength, showCount = !!props.maxLength } = own;
  const { field, invalid, disabled, readOnly, shell, a11y } = useFieldBinding(common);
  const value = (field.value as string | undefined) ?? '';
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!autoResize || !el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, maxRows * LINE_HEIGHT_PX + 18)}px`;
  }, [value, autoResize, maxRows]);

  const counter =
    showCount && maxLength ? (
      <span className="ml-auto tabular-nums" aria-hidden>
        {value.length}/{maxLength}
      </span>
    ) : null;

  return (
    <FormField {...shell} hint={shell.hint ?? counter}>
      <Textarea
        {...a11y}
        ref={(node) => {
          ref.current = node;
          field.ref(node);
        }}
        name={field.name}
        rows={rows}
        placeholder={placeholder}
        maxLength={maxLength}
        autoFocus={common.autoFocus}
        value={value}
        onChange={field.onChange}
        onBlur={field.onBlur}
        disabled={disabled}
        readOnly={readOnly}
        invalid={invalid}
        className={autoResize ? 'resize-none overflow-y-auto' : undefined}
      />
    </FormField>
  );
}

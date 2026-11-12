import { OtpInput } from '../ui/OtpInput';
import { FormField } from './FormField';
import type { FieldCommonProps } from './types';
import { useFieldBinding } from './useFieldBinding';

export interface OtpFieldProps extends FieldCommonProps {
  /** Number of digits (default 6). */
  length?: number;
  /** Called with the full code once every box is filled (e.g. auto-submit). */
  onComplete?: (code: string) => void;
}

/** One-time code field; value is a string of digits. Validate with otpRule(length). */
export function OtpField({ length = 6, onComplete, autoFocus, ...props }: OtpFieldProps) {
  const { field, invalid, ids, disabled, readOnly, shell, a11y } = useFieldBinding(props);
  const labelId = `${ids.id}-label`;

  return (
    <FormField {...shell} labelAsText labelId={labelId}>
      <OtpInput
        length={length}
        id={a11y.id}
        ref={field.ref}
        value={(field.value as string | undefined) ?? ''}
        onChange={field.onChange}
        onComplete={onComplete}
        onBlur={field.onBlur}
        invalid={invalid}
        disabled={disabled}
        readOnly={readOnly}
        autoFocus={autoFocus}
        aria-labelledby={props.label ? labelId : undefined}
        aria-describedby={a11y['aria-describedby']}
        aria-required={a11y['aria-required']}
      />
    </FormField>
  );
}

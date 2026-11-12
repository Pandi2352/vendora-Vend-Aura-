import { Slider, type SliderMark } from '../ui/Slider';
import { FormField } from './FormField';
import type { FieldCommonProps } from './types';
import { useFieldBinding } from './useFormFieldController';

export interface SliderFieldProps extends FieldCommonProps {
  min?: number;
  max?: number;
  step?: number;
  marks?: SliderMark[] | boolean;
  /** Show the formatted value beside the track (default true). */
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

/** Number picked on a slider. Value is a number (empty shows `min`). Validate with rules.number(). */
export function SliderField({ min = 0, max = 100, step = 1, marks, showValue = true, formatValue, autoFocus, ...props }: SliderFieldProps) {
  const { field, invalid, ids, disabled, readOnly, shell, a11y } = useFieldBinding(props);
  const labelId = `${ids.id}-label`;
  const value = typeof field.value === 'number' ? field.value : min;

  return (
    <FormField {...shell} labelAsText labelId={labelId}>
      <Slider
        id={a11y.id}
        ref={field.ref}
        value={value}
        onChange={field.onChange}
        onBlur={field.onBlur}
        min={min}
        max={max}
        step={step}
        marks={marks}
        showValue={showValue}
        formatValue={formatValue}
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

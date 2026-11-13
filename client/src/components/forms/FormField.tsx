import { useId, type ReactNode } from 'react';
import { CheckCircle, Info, Warning, WarningCircle } from '@phosphor-icons/react';
import { Label } from '../ui/Label';
import { Tooltip } from '../ui/overlay/Tooltip';
import { cn } from '../ui/cn';
import type { FieldCommonProps } from './types';
import type { FieldIds } from './useFieldIds';

type ShellProps = Pick<
  FieldCommonProps,
  | 'label'
  | 'hideLabel'
  | 'required'
  | 'optional'
  | 'tooltip'
  | 'labelAction'
  | 'description'
  | 'hint'
  | 'warning'
  | 'success'
  | 'layout'
  | 'className'
>;

export interface FormFieldProps extends ShellProps {
  error?: string;
  ids: FieldIds;
  children: ReactNode;
  /** Label element id, for controls labelled via aria-labelledby (dropdown, radio group). */
  labelId?: string;
  /** Render the label as plain text (group controls label themselves via aria-labelledby). */
  labelAsText?: boolean;
}

const MESSAGE_TONES = {
  error: {
    className: 'text-red-600 font-medium',
    icon: <WarningCircle aria-hidden weight="fill" className="w-3.5 h-3.5 shrink-0" />,
  },
  warning: {
    className: 'text-amber-700 font-medium',
    icon: <Warning aria-hidden weight="fill" className="w-3.5 h-3.5 shrink-0" />,
  },
  success: {
    className: 'text-emerald-700 font-medium',
    icon: <CheckCircle aria-hidden weight="fill" className="w-3.5 h-3.5 shrink-0" />,
  },
} as const;

/**
 * Field shell: label row (asterisk / "optional" / info tooltip / action),
 * optional description, the control, then ONE message line —
 * error > warning > success > hint. The message line keeps its height, so
 * grids stay aligned and the form does not jump when an error appears.
 */
export function FormField({
  label,
  hideLabel,
  required,
  optional,
  tooltip,
  labelAction,
  description,
  hint,
  warning,
  success,
  layout = 'vertical',
  className,
  error,
  ids,
  children,
  labelId,
  labelAsText,
}: FormFieldProps) {
  const tone = error ? 'error' : warning ? 'warning' : success ? 'success' : null;
  const message = error ?? warning ?? success ?? hint;
  const autoLabelId = useId();
  const horizontal = layout === 'horizontal';

  const labelRow = label ? (
    <div
      className={cn(
        'flex items-center justify-between gap-2 mb-1',
        hideLabel && 'sr-only',
        horizontal && 'sm:mb-0 sm:pt-2.5',
      )}
    >
      <span className="flex items-center gap-1 min-w-0">
        {labelAsText ? (
          <span id={labelId ?? autoLabelId} className="text-xs font-semibold text-zinc-700 leading-none">
            {label}
            {required && (
              <span className="text-red-600 ml-0.5" aria-hidden>
                *
              </span>
            )}
          </span>
        ) : (
          <Label id={labelId} htmlFor={ids.id} required={required} className="mb-0 leading-none">
            {label}
          </Label>
        )}
        {optional && !required && <span className="text-xs text-zinc-400">(optional)</span>}
        {tooltip && (
          <Tooltip content={tooltip}>
            <button
              type="button"
              aria-label="More information"
              className="inline-flex items-center justify-center w-3.5 h-3.5 -my-1 rounded-md text-zinc-400 hover:text-zinc-600 cursor-help"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        )}
      </span>
      {labelAction && <span className="text-xs shrink-0">{labelAction}</span>}
    </div>
  ) : null;

  return (
    <div className={cn('min-w-0', horizontal && 'sm:grid sm:grid-cols-[minmax(8rem,14rem)_1fr] sm:gap-x-4', className)}>
      {labelRow}
      <div className="min-w-0">
        {description && (
          <p id={ids.descriptionId} className="text-xs text-zinc-500 -mt-0.5 mb-1.5">
            {description}
          </p>
        )}
        {children}
        <p
          id={ids.messageId}
          aria-live="polite"
          className={cn(
            'flex items-start gap-1 min-h-5 pt-1 text-xs leading-4',
            tone ? MESSAGE_TONES[tone].className : 'text-zinc-500',
          )}
        >
          {tone && MESSAGE_TONES[tone].icon}
          {message && <span className="min-w-0">{message}</span>}
        </p>
      </div>
    </div>
  );
}

import { useId, type ReactNode } from 'react';
import { WarningCircle } from '@phosphor-icons/react';
import { Label } from '../ui/Label';
import { cn } from '../ui/cn';

export interface FieldIds {
  id: string;
  messageId: string;
  /** For aria-describedby on the control. */
  describedBy: string | undefined;
}

/** Stable ids for a field's control and its hint / error line. */
export function useFieldIds(name: string, id?: string, hasMessage = true): FieldIds {
  const auto = useId();
  const controlId = id ?? `f-${name.replace(/\W/g, '-')}-${auto}`;
  return { id: controlId, messageId: `${controlId}-msg`, describedBy: hasMessage ? `${controlId}-msg` : undefined };
}

export interface FormFieldProps {
  label?: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  ids: FieldIds;
  children: ReactNode;
  className?: string;
  /** Label element id, for controls labelled via aria-labelledby (dropdown, radio group). */
  labelId?: string;
  /** Keep the label for screen readers but hide it visually (repeated rows in tables). */
  hideLabel?: boolean;
}

/**
 * Field layout: label, control, then one message line (error, else hint).
 * The message line always keeps its height, so fields in a grid stay aligned
 * and the form does not jump when an error appears.
 */
export function FormField({ label, required, hint, error, ids, children, className, labelId, hideLabel }: FormFieldProps) {
  return (
    <div className={cn('min-w-0', className)}>
      {label && (
        <Label id={labelId} htmlFor={ids.id} required={required} className={hideLabel ? 'sr-only' : undefined}>
          {label}
        </Label>
      )}
      {children}
      <p
        id={ids.messageId}
        aria-live="polite"
        className={cn('flex items-start gap-1 min-h-5 pt-1 text-xs leading-4', error ? 'text-red-600 font-medium' : 'text-zinc-500')}
      >
        {error ? (
          <>
            <WarningCircle aria-hidden weight="fill" className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </>
        ) : (
          hint
        )}
      </p>
    </div>
  );
}

import type { ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '../ui/Button';
import { cn } from '../ui/cn';

/**
 * Responsive field grid. No vertical gap: each FormField reserves its own
 * message line, which provides the spacing and keeps rows aligned.
 */
export function FormGrid({
  columns = 2,
  children,
  className,
}: {
  columns?: 1 | 2 | 3 | 4;
  children: ReactNode;
  className?: string;
}) {
  const cols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
  }[columns];
  return <div className={cn('grid gap-x-4 gap-y-1', cols, className)}>{children}</div>;
}

/** Titled group of fields inside a larger form. */
export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="border-t border-zinc-100 pt-4 first:border-t-0 first:pt-0">
      <legend className="sr-only">{title}</legend>
      <p className="text-sm font-bold text-zinc-900">{title}</p>
      {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
      <div className="mt-3">{children}</div>
    </fieldset>
  );
}

interface FormActionsProps {
  submitLabel: string;
  submittingLabel?: string;
  onCancel?: () => void;
  cancelLabel?: string;
  /** Edit forms: keep Save disabled until something changed. */
  requireChanges?: boolean;
  fullWidth?: boolean;
  className?: string;
  submitIcon?: ReactNode;
}

/**
 * Cancel + Submit. Submit stays clickable while the form is invalid (clicking
 * reveals every error); it shows a spinner and is disabled while submitting.
 */
export function FormActions({
  submitLabel,
  submittingLabel,
  onCancel,
  cancelLabel = 'Cancel',
  requireChanges = false,
  fullWidth = false,
  className,
  submitIcon,
}: FormActionsProps) {
  const { formState } = useFormContext();
  const { isSubmitting, isDirty } = formState;

  return (
    <div
      className={cn('flex items-center justify-end gap-2 pt-2', fullWidth && 'flex-col-reverse sm:flex-row', className)}
    >
      {onCancel && (
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting} fullWidth={fullWidth}>
          {cancelLabel}
        </Button>
      )}
      <Button
        type="submit"
        loading={isSubmitting}
        disabled={requireChanges && !isDirty}
        icon={submitIcon}
        fullWidth={fullWidth}
      >
        {isSubmitting && submittingLabel ? submittingLabel : submitLabel}
      </Button>
    </div>
  );
}

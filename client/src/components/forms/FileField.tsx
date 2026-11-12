import { FileDropzone } from '../ui/FileDropzone';
import { FormField } from './FormField';
import type { FieldCommonProps } from './types';
import { useFieldBinding } from './useFormFieldController';

export interface FileFieldProps extends FieldCommonProps {
  /** Extensions and/or MIME types, e.g. ['image/*', '.pdf']. */
  accept?: string[];
  /** Per-file size limit in bytes. */
  maxBytes?: number;
  /** Value is File[] when true, File | null otherwise. */
  multiple?: boolean;
  maxFiles?: number;
  /** Main text inside the drop zone. */
  title?: string;
  onReject?: (messages: string[]) => void;
}

/**
 * Drag & drop / browse file picker. Value: File[] (multiple) or File | null.
 * Validate with fileRule(); the caller uploads the files on submit.
 */
export function FileField({ accept, maxBytes, multiple = false, maxFiles, title, onReject, autoFocus, ...props }: FileFieldProps) {
  const { field, invalid, ids, disabled, readOnly, shell, a11y } = useFieldBinding(props);
  const labelId = `${ids.id}-label`;
  const raw = field.value as File[] | File | null | undefined;
  const files = Array.isArray(raw) ? raw : raw ? [raw] : [];

  return (
    <FormField {...shell} labelAsText labelId={labelId}>
      <FileDropzone
        id={a11y.id}
        ref={field.ref}
        value={files}
        onChange={(next) => field.onChange(multiple ? next : (next[0] ?? null))}
        onBlur={field.onBlur}
        onReject={onReject}
        accept={accept}
        maxBytes={maxBytes}
        multiple={multiple}
        maxFiles={maxFiles}
        title={title}
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

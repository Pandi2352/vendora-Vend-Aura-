import { useEffect, useRef, useState, type DragEvent, type FocusEvent, type Ref } from 'react';
import { FileText, UploadSimple, X } from '@phosphor-icons/react';
import { validateFile } from '@/utils/browser';
import { formatFileSize } from '@/utils/number';
import { cn } from './cn';

export interface FileDropzoneProps {
  /** Chosen files (the caller uploads them). */
  value: File[];
  onChange: (files: File[]) => void;
  /** Extensions and/or MIME types, e.g. ['image/*', '.pdf']. */
  accept?: string[];
  /** Per-file size limit in bytes. */
  maxBytes?: number;
  multiple?: boolean;
  /** Limit on the total number of files (multiple only). */
  maxFiles?: number;
  /** Called with per-file messages when files are refused (they are also listed under the zone). */
  onReject?: (messages: string[]) => void;
  /** Called when focus leaves the zone and its file list. */
  onBlur?: () => void;
  /** Main text in the zone. */
  title?: string;
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  id?: string;
  /** Ref of the zone button (RHF focuses it on error). */
  ref?: Ref<HTMLButtonElement>;
  className?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-required'?: boolean;
}

/** Splits picked files into accepted ones and "name: reason" messages. */
function sortFiles(picked: File[], current: File[], opts: Pick<FileDropzoneProps, 'accept' | 'maxBytes' | 'multiple' | 'maxFiles'>) {
  const accepted: File[] = [];
  const messages: string[] = [];
  const room = opts.multiple ? (opts.maxFiles ?? Infinity) - current.length : 1;
  for (const file of picked) {
    let reason = validateFile(file, { accept: opts.accept, maxBytes: opts.maxBytes });
    if (reason && opts.maxBytes && file.size > opts.maxBytes) reason = `File is too large. The limit is ${formatFileSize(opts.maxBytes)}.`;
    if (!reason && accepted.length >= room) {
      reason = opts.multiple ? `You can add up to ${opts.maxFiles} files.` : 'Only one file can be added.';
    }
    if (reason) messages.push(`${file.name}: ${reason}`);
    else accepted.push(file);
  }
  return { accepted, messages };
}

/** Drag & drop zone that is also a button opening the file dialog. No upload logic. */
export function FileDropzone({
  value,
  onChange,
  accept = [],
  maxBytes,
  multiple = false,
  maxFiles,
  onReject,
  onBlur,
  title,
  invalid,
  disabled,
  readOnly,
  autoFocus,
  id,
  ref,
  className,
  ...aria
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const zoneRef = useRef<HTMLButtonElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState<string[]>([]);
  const locked = disabled || readOnly;

  const addFiles = (picked: File[]) => {
    if (locked || picked.length === 0) return;
    const { accepted, messages } = sortFiles(picked, multiple ? value : [], { accept, maxBytes, multiple, maxFiles });
    setRejected(messages);
    if (messages.length) onReject?.(messages);
    if (accepted.length) onChange(multiple ? [...value, ...accepted] : accepted.slice(0, 1));
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(Array.from(e.dataTransfer?.files ?? []));
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!locked) setDragging(true);
  };

  const onGroupBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onBlur?.();
  };

  const limits = [accept.length ? accept.join(', ') : null, maxBytes ? `up to ${formatFileSize(maxBytes)}` : null, multiple && maxFiles ? `max ${maxFiles} files` : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className={cn('flex flex-col gap-2', className)} onBlur={onGroupBlur}>
      {/* The button stands in for the hidden file input, so it carries the field's aria-invalid state. */}
      {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
      <button
        ref={(el) => {
          zoneRef.current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) ref.current = el;
        }}
        id={id}
        type="button"
        disabled={disabled}
        aria-disabled={readOnly || undefined}
        // Forwards the caller's explicit autoFocus opt-in.
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        aria-labelledby={aria['aria-labelledby']}
        aria-describedby={aria['aria-describedby']}
        aria-invalid={invalid || undefined}
        onClick={() => !locked && inputRef.current?.click()}
        onDragEnter={onDragOver}
        onDragOver={onDragOver}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed px-4 py-6 text-center transition-colors outline-none',
          'focus-visible:outline-2 focus-visible:outline-offset-0',
          invalid ? 'border-red-500 focus-visible:outline-red-100' : 'border-zinc-300 focus-visible:border-primary-600 focus-visible:outline-primary-100',
          dragging ? 'border-primary-600 bg-primary-50' : 'bg-white',
          locked ? 'cursor-not-allowed bg-zinc-50 text-zinc-400' : 'cursor-pointer hover:border-zinc-400 hover:bg-zinc-50',
        )}
      >
        <UploadSimple aria-hidden className={cn('h-6 w-6', dragging ? 'text-primary-600' : 'text-zinc-400')} />
        <span className="text-sm font-medium text-zinc-800">
          {title ?? (dragging ? 'Drop to add' : multiple ? 'Drag files here or click to browse' : 'Drag a file here or click to browse')}
        </span>
        {limits && <span className="text-xs text-zinc-500">{limits}</span>}
      </button>
      <input
        ref={inputRef}
        type="file"
        tabIndex={-1}
        aria-hidden
        className="hidden"
        accept={accept.join(',') || undefined}
        multiple={multiple}
        disabled={locked}
        onChange={(e) => {
          addFiles(Array.from(e.target.files ?? []));
          e.target.value = ''; // picking the same file again still fires change
        }}
      />
      {rejected.length > 0 && (
        <ul role="alert" className="flex flex-col gap-0.5 text-xs font-medium text-red-600">
          {rejected.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
      {value.length > 0 && (
        <ul className="flex flex-col gap-2" aria-label="Chosen files">
          {value.map((file, i) => (
            <FileItem
              key={`${file.name}-${file.size}-${file.lastModified}-${i}`}
              file={file}
              removable={!locked}
              onRemove={() => {
                onChange(value.filter((_, k) => k !== i));
                setRejected([]);
                zoneRef.current?.focus(); // the removed row took focus with it
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function FileItem({ file, removable, onRemove }: { file: File; removable: boolean; onRemove: () => void }) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file.type.startsWith('image/') || typeof URL.createObjectURL !== 'function') return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <li className="flex items-center gap-3 rounded-md border border-zinc-200 bg-white p-2">
      {preview ? (
        <img src={preview} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover" />
      ) : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-500">
          <FileText aria-hidden className="h-5 w-5" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-zinc-800">{file.name}</span>
        <span className="block text-xs text-zinc-500">{formatFileSize(file.size)}</span>
      </span>
      {removable && (
        <button
          type="button"
          aria-label={`Remove ${file.name}`}
          onClick={onRemove}
          className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-primary-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </li>
  );
}

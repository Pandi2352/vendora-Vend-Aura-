import { useRef, useState, type InputHTMLAttributes, type Ref } from 'react';
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import { useDebouncedCallback } from '@/hooks/common';
import { cn } from './cn';
import { controlShellClass } from './field-styles';
import { Spinner } from './Spinner';

type NativeProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'type' | 'ref'>;

export interface SearchInputProps extends NativeProps {
  /** Controlled value; omit to let the input keep its own text. */
  value?: string;
  defaultValue?: string;
  /** Every keystroke (and '' on clear). */
  onChange?: (value: string) => void;
  /** Debounced search with the current text ('' after clearing). */
  onSearch?: (value: string) => void;
  /** Debounce for onSearch in ms (default 300). */
  debounceMs?: number;
  /** Shows a spinner in place of the clear button (results loading). */
  loading?: boolean;
  invalid?: boolean;
  /** Accessible name of the clear button. */
  clearLabel?: string;
  ref?: Ref<HTMLInputElement>;
  /** Classes for the outer wrapper. */
  className?: string;
}

/** Search box: magnifier, clear button, loading spinner, Escape clears, debounced onSearch. */
export function SearchInput({
  value,
  defaultValue = '',
  onChange,
  onSearch,
  debounceMs = 300,
  loading,
  invalid,
  clearLabel = 'Clear search',
  placeholder = 'Search…',
  disabled,
  readOnly,
  className,
  ref,
  onKeyDown,
  ...rest
}: SearchInputProps) {
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debouncedSearch = useDebouncedCallback((text: string) => onSearch?.(text), debounceMs);
  const locked = disabled || readOnly;

  const update = (text: string) => {
    if (value === undefined) setInner(text);
    onChange?.(text);
    debouncedSearch(text);
  };

  const clear = () => {
    update('');
    inputRef.current?.focus();
  };

  return (
    <div className={cn(controlShellClass(invalid, disabled), 'items-center', className)}>
      <MagnifyingGlass aria-hidden className="ml-3 h-4 w-4 shrink-0 text-zinc-400" />
      <input
        {...rest}
        ref={(el) => {
          inputRef.current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) ref.current = el;
        }}
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={invalid || undefined}
        value={current}
        onChange={(e) => update(e.target.value)}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.key === 'Escape' && current && !locked) {
            e.preventDefault();
            e.stopPropagation(); // clear first; a second Escape can close the dialog
            update('');
          }
        }}
        className={cn(
          'h-full flex-1 min-w-0 bg-transparent px-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none',
          'disabled:cursor-not-allowed disabled:text-zinc-400 [&::-webkit-search-cancel-button]:appearance-none',
        )}
      />
      <span className="flex w-9 shrink-0 items-center justify-center">
        {loading ? (
          <Spinner size="sm" label="Searching" className="text-zinc-400" />
        ) : (
          current &&
          !locked && (
            <button
              type="button"
              aria-label={clearLabel}
              onClick={clear}
              className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-primary-600"
            >
              <X className="h-4 w-4" />
            </button>
          )
        )}
      </span>
    </div>
  );
}

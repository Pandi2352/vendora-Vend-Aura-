import { useRef, type KeyboardEvent, type Ref } from 'react';
import { CaretDown, X } from '@phosphor-icons/react';
import { cn } from '../cn';
import { controlShellClass } from '../field-styles';
import { Spinner } from '../Spinner';
import { useDropdown } from './useDropdown';
import { DropdownPanel } from './DropdownPanel';
import type { DropdownOption, DropdownValue } from './dropdown-utils';

export interface MultiSelectProps<V extends DropdownValue = string> {
  options: DropdownOption<V>[];
  value: V[];
  onChange: (value: V[]) => void;
  /** Called when the user leaves the control (marks the field touched in forms). */
  onBlur?: () => void;
  placeholder?: string;
  /** Search box inside the list. Defaults to on when there are more than 7 options. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Server-side search (async options): called with the typed query. */
  onSearch?: (query: string) => void;
  loading?: boolean;
  /** Upper limit; other options are disabled once it is reached. */
  maxSelected?: number;
  /** Chips shown in the trigger before "+N more" (default 3). */
  maxVisibleChips?: number;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  emptyMessage?: string;
  autoFocus?: boolean;
  id?: string;
  name?: string;
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-required'?: boolean;
  /** Receives the trigger button (forms focus it on validation errors). */
  ref?: Ref<HTMLButtonElement>;
}

const headerButton =
  'px-2 py-1 rounded-md text-xs font-semibold text-primary-700 hover:bg-primary-50 cursor-pointer disabled:text-zinc-300 disabled:cursor-not-allowed disabled:hover:bg-transparent';

/**
 * Multi-value select: removable chips in an h-10 trigger, list stays open while
 * picking (Space / Enter / click toggle), "Select all" / "Clear" (Ctrl+A in the
 * list), optional max, Backspace on the trigger removes the last chip.
 */
export function MultiSelect<V extends DropdownValue = string>({
  options,
  value,
  onChange,
  onBlur,
  placeholder = 'Select…',
  searchable,
  searchPlaceholder = 'Search…',
  onSearch,
  loading = false,
  maxSelected,
  maxVisibleChips = 3,
  disabled = false,
  readOnly = false,
  invalid = false,
  emptyMessage = 'No options',
  autoFocus,
  id,
  name,
  className,
  ref,
  ...aria
}: MultiSelectProps<V>) {
  // Remember labels of picked options so chips keep them when async options change.
  const labels = useRef(new Map<V, string>());
  for (const o of options) labels.current.set(o.value, o.label);
  const labelOf = (v: V) => labels.current.get(v) ?? String(v);
  const lockedValues = new Set(options.filter((o) => o.disabled).map((o) => o.value));

  const selectedSet = new Set(value);
  const isSelected = (v: V) => selectedSet.has(v);
  const atMax = maxSelected !== undefined && value.length >= maxSelected;
  const effectiveOptions = atMax
    ? options.map((o) => (o.disabled || selectedSet.has(o.value) ? o : { ...o, disabled: true }))
    : options;

  const toggle = (v: V) => {
    if (selectedSet.has(v)) onChange(value.filter((x) => x !== v));
    else if (!atMax) onChange([...value, v]);
  };

  const containerRef = useRef<HTMLDivElement | null>(null);
  const state = useDropdown<V>({
    options: effectiveOptions,
    isSelected,
    onPick: (option) => {
      toggle(option.value);
      return true;
    },
    onBlur,
    disabled: disabled || readOnly,
    searchable,
    onSearch,
    id,
    containerRef,
  });
  const { refs, ids, open, filtered } = state;
  const editable = !disabled && !readOnly;

  const addable = filtered.filter((o) => !o.disabled && !selectedSet.has(o.value)).map((o) => o.value);
  const room = maxSelected === undefined ? addable.length : Math.max(0, maxSelected - value.length);
  const removable = value.filter((v) => !lockedValues.has(v));
  const selectAll = () => {
    if (addable.length && room) onChange([...value, ...addable.slice(0, room)]);
  };
  const clearAll = () => {
    if (removable.length) onChange(value.filter((v) => lockedValues.has(v)));
  };

  const remove = (v: V) => {
    onChange(value.filter((x) => x !== v));
    refs.triggerRef.current?.focus();
  };

  const setTriggerRef = (node: HTMLButtonElement | null) => {
    refs.triggerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as { current: HTMLButtonElement | null }).current = node;
  };

  const onTriggerKeyDown = (e: KeyboardEvent) => {
    if (!open && (e.key === 'Backspace' || e.key === 'Delete')) {
      const last = [...removable].pop();
      if (last !== undefined) {
        e.preventDefault();
        onChange(value.filter((x) => x !== last));
      }
      return;
    }
    state.handleTriggerKeys(e);
  };

  // Ctrl/Cmd+A in the list (not in the search box) selects all, per APG listbox.
  const panelState = {
    ...state,
    handleListKeys: (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a' && e.target === refs.listRef.current) {
        e.preventDefault();
        selectAll();
        return;
      }
      state.handleListKeys(e);
    },
  };

  const visible = value.slice(0, maxVisibleChips);
  const hidden = value.length - visible.length;
  const summary = value.length ? value.map(labelOf).join(', ') : placeholder;

  return (
    <div ref={containerRef} className={cn(controlShellClass(invalid, disabled), 'relative', readOnly && 'bg-zinc-50', className)}>
      <button
        ref={setTriggerRef}
        id={ids.triggerId}
        name={name}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? ids.listId : undefined}
        aria-invalid={invalid || undefined}
        aria-readonly={readOnly || undefined}
        aria-label={aria['aria-label']}
        aria-labelledby={aria['aria-labelledby']}
        aria-describedby={aria['aria-describedby']}
        aria-required={aria['aria-required']}
        disabled={disabled}
        // Forwards the caller's explicit autoFocus opt-in.
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        onClick={() => (readOnly ? undefined : open ? state.closeList(true) : state.openList())}
        onKeyDown={readOnly ? undefined : onTriggerKeyDown}
        onBlur={(e) => {
          if (!open && !refs.panelRef.current?.contains(e.relatedTarget as Node)) onBlur?.();
        }}
        className={cn('absolute inset-0 w-full rounded-md outline-none', editable ? 'cursor-pointer' : readOnly ? 'cursor-default' : 'cursor-not-allowed')}
      >
        <span className="sr-only">{summary}</span>
      </button>

      <div className="relative flex flex-1 min-w-0 items-center gap-1 pl-2 pr-9 overflow-hidden pointer-events-none">
        {value.length === 0 && <span aria-hidden className="pl-1 text-sm text-zinc-400 truncate">{placeholder}</span>}
        {visible.map((v) => (
          <span
            key={String(v)}
            className={cn(
              'inline-flex items-center gap-0.5 h-6 max-w-[9rem] shrink-0 rounded-md border pl-2 text-xs',
              disabled ? 'border-zinc-200 bg-zinc-100 text-zinc-400' : 'border-primary-200 bg-primary-50 text-primary-800',
              editable && !lockedValues.has(v) ? 'pr-0.5' : 'pr-2',
            )}
          >
            <span aria-hidden className="truncate">{labelOf(v)}</span>
            {editable && !lockedValues.has(v) && (
              <button
                type="button"
                tabIndex={-1}
                aria-label={`Remove ${labelOf(v)}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => remove(v)}
                className="pointer-events-auto inline-flex items-center justify-center w-5 h-5 rounded-md text-primary-600 hover:bg-primary-100 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
        {hidden > 0 && <span aria-hidden className="shrink-0 text-xs font-medium text-zinc-500">+{hidden} more</span>}
      </div>

      {loading && !open ? (
        <Spinner size="sm" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
      ) : (
        <CaretDown
          aria-hidden
          className={cn(
            'pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 transition-transform',
            open && 'rotate-180',
          )}
        />
      )}

      <DropdownPanel<V>
        state={panelState}
        isSelected={isSelected}
        multiple
        searchPlaceholder={searchPlaceholder}
        emptyMessage={emptyMessage}
        loading={loading}
        listLabel={aria['aria-label'] ?? placeholder}
        listLabelledBy={aria['aria-labelledby']}
        header={
          <div className="flex items-center justify-between gap-2 px-2 py-1.5 border-b border-zinc-100">
            <button type="button" className={headerButton} onMouseDown={(e) => e.preventDefault()} onClick={selectAll} disabled={!addable.length || !room}>
              Select all
            </button>
            <button type="button" className={headerButton} onMouseDown={(e) => e.preventDefault()} onClick={clearAll} disabled={!removable.length}>
              Clear
            </button>
          </div>
        }
        footer={
          <div aria-live="polite" className="px-3 py-1.5 border-t border-zinc-100 text-xs text-zinc-500">
            {value.length} selected
            {maxSelected !== undefined && (atMax ? ` · Limit of ${maxSelected} reached` : ` · Up to ${maxSelected}`)}
          </div>
        }
      />
    </div>
  );
}

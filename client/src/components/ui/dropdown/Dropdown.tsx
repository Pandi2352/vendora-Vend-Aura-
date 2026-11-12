import type { ReactNode, Ref } from 'react';
import { CaretDown, X } from '@phosphor-icons/react';
import { cn } from '../cn';
import { controlClass } from '../field-styles';
import { Spinner } from '../Spinner';
import { useDropdown } from './useDropdown';
import { DropdownPanel } from './DropdownPanel';
import type { DropdownOption, DropdownValue } from './dropdown-utils';

export interface DropdownProps<V extends DropdownValue = string> {
  options: DropdownOption<V>[];
  value: V | null | undefined;
  onChange: (value: V | null) => void;
  /** Called when the user leaves the control (marks the field touched in forms). */
  onBlur?: () => void;
  placeholder?: string;
  /** Search box inside the list. Defaults to on when there are more than 7 options. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Server-side search (async options): called with the typed query. */
  onSearch?: (query: string) => void;
  /** Options are loading (async). */
  loading?: boolean;
  /** Shows an × to reset to no value. */
  clearable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  emptyMessage?: string;
  /** Icon shown at the start of the trigger. */
  leftIcon?: ReactNode;
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

/**
 * Select replacement (no native <select>): same height/states as inputs, optional
 * (async) search, clear, keyboard support (arrows, Home/End, PageUp/Down, Enter,
 * Space, Esc, Tab, type-ahead), screen-reader roles, and a portal list that is never clipped.
 */
export function Dropdown<V extends DropdownValue = string>({
  options,
  value,
  onChange,
  onBlur,
  placeholder = 'Select…',
  searchable,
  searchPlaceholder = 'Search…',
  onSearch,
  loading = false,
  clearable = false,
  disabled = false,
  readOnly = false,
  invalid = false,
  emptyMessage = 'No options',
  leftIcon,
  id,
  name,
  className,
  ref,
  ...aria
}: DropdownProps<V>) {
  const isSelected = (v: V) => v === value;
  const state = useDropdown<V>({
    options,
    isSelected,
    onPick: (option) => onChange(option.value),
    onBlur,
    disabled: disabled || readOnly,
    searchable,
    onSearch,
    id,
  });
  const { refs, ids, open } = state;
  const selected = options.find((o) => o.value === value) ?? null;
  const showClear = clearable && selected && !disabled && !readOnly;

  const setTriggerRef = (node: HTMLButtonElement | null) => {
    refs.triggerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as { current: HTMLButtonElement | null }).current = node;
  };

  return (
    <div className="relative w-full">
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
        onClick={() => (readOnly ? undefined : open ? state.closeList(true) : state.openList())}
        onKeyDown={readOnly ? undefined : state.handleTriggerKeys}
        onBlur={(e) => {
          if (!open && !refs.panelRef.current?.contains(e.relatedTarget as Node)) onBlur?.();
        }}
        className={controlClass(
          invalid,
          cn(
            'flex items-center gap-2 text-left',
            readOnly ? 'cursor-default bg-zinc-50' : 'cursor-pointer',
            showClear ? 'pr-16' : 'pr-9',
            className,
          ),
        )}
      >
        {(selected?.icon ?? leftIcon) && (
          <span className="shrink-0 text-zinc-500 [&>svg]:w-4 [&>svg]:h-4">{selected?.icon ?? leftIcon}</span>
        )}
        <span className={cn('flex-1 truncate', !selected && 'text-zinc-400')}>{selected?.label ?? placeholder}</span>
      </button>

      {showClear && (
        <button
          type="button"
          aria-label="Clear selection"
          onClick={() => {
            onChange(null);
            refs.triggerRef.current?.focus();
          }}
          className="absolute right-8 top-1/2 -translate-y-1/2 w-6 h-6 inline-flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
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
        state={state}
        isSelected={isSelected}
        searchPlaceholder={searchPlaceholder}
        emptyMessage={emptyMessage}
        loading={loading}
        listLabel={aria['aria-label'] ?? placeholder}
        listLabelledBy={aria['aria-labelledby']}
      />
    </div>
  );
}

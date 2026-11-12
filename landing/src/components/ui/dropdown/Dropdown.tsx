import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type Ref } from 'react';
import { createPortal } from 'react-dom';
import { CaretDown, Check, MagnifyingGlass, X } from '@phosphor-icons/react';
import { cn } from '../cn';
import { controlClass } from '../field-styles';
import { useAnchoredPosition } from './useAnchoredPosition';
import {
  firstEnabledIndex,
  lastEnabledIndex,
  matchesQuery,
  nextEnabledIndex,
  typeAheadIndex,
  type DropdownOption,
  type DropdownValue,
} from './dropdown-utils';

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
  /** Shows an × to reset to no value. */
  clearable?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  /** Tinted trigger, e.g. for a filter holding a non-default value. */
  highlighted?: boolean;
  emptyMessage?: string;
  id?: string;
  name?: string;
  /** Classes for the trigger button. */
  className?: string;
  /** Classes for the outer wrapper; set a width here (defaults to w-full). */
  wrapperClassName?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-required'?: boolean;
  /** Receives the trigger button (forms focus it on validation errors). */
  ref?: Ref<HTMLButtonElement>;
}

const TYPEAHEAD_RESET_MS = 600;

/**
 * Select replacement (no native <select>): same height/states as inputs, optional
 * search, clear, keyboard support (arrows, Home/End, PageUp/Down, Enter, Esc, Tab,
 * type-ahead), screen-reader roles, and a portal list that is never clipped.
 */
export function Dropdown<V extends DropdownValue = string>({
  options,
  value,
  onChange,
  onBlur,
  placeholder = 'Select…',
  searchable,
  searchPlaceholder = 'Search…',
  clearable = false,
  disabled = false,
  invalid = false,
  highlighted = false,
  emptyMessage = 'No options',
  id,
  name,
  className,
  wrapperClassName,
  ref,
  ...aria
}: DropdownProps<V>) {
  const autoId = useId();
  const triggerId = id ?? `dropdown-${autoId}`;
  const listId = `${triggerId}-list`;
  const optionId = (index: number) => `${triggerId}-opt-${index}`;

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const typeAhead = useRef({ text: '', timer: 0 });

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const isSearchable = searchable ?? options.length > 7;
  const filtered = useMemo(
    () => (isSearchable && query ? options.filter((o) => matchesQuery(o, query)) : options),
    [options, query, isSearchable],
  );
  const selected = options.find((o) => o.value === value) ?? null;
  const position = useAnchoredPosition(triggerRef, open);

  const setTriggerRef = (node: HTMLButtonElement | null) => {
    triggerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as { current: HTMLButtonElement | null }).current = node;
  };

  const openList = (seedQuery = '') => {
    if (disabled) return;
    setQuery(seedQuery);
    const list = seedQuery && isSearchable ? options.filter((o) => matchesQuery(o, seedQuery)) : options;
    const selectedIndex = list.findIndex((o) => o.value === value && !o.disabled);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : firstEnabledIndex(list));
    setOpen(true);
  };

  const closeList = (refocus: boolean) => {
    setOpen(false);
    setQuery('');
    if (refocus) triggerRef.current?.focus();
    onBlur?.();
  };

  const choose = (index: number) => {
    const option = filtered[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    closeList(true);
  };

  // Focus the search box (or the list) when opening; keep the active option visible.
  // The panel renders once its position is measured, so wait for that before focusing into it.
  const panelReady = open && position !== null;
  useEffect(() => {
    if (!panelReady) return;
    (isSearchable ? searchRef.current : listRef.current)?.focus();
  }, [panelReady, isSearchable]);

  useEffect(() => {
    if (open && activeIndex >= 0) document.getElementById(optionId(activeIndex))?.scrollIntoView({ block: 'nearest' });
    // optionId only depends on the stable trigger id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeIndex]);

  // Close on outside pointer down.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!panelRef.current?.contains(target) && !triggerRef.current?.contains(target)) closeList(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
    // closeList reads current props at call time; re-subscribing per render is unnecessary.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleListKeys = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => (i < 0 ? firstEnabledIndex(filtered) : nextEnabledIndex(filtered, i, 1)));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => (i < 0 ? lastEnabledIndex(filtered) : nextEnabledIndex(filtered, i, -1)));
        break;
      case 'PageDown':
        e.preventDefault();
        setActiveIndex((i) => nextEnabledIndex(filtered, Math.max(i, 0), 1, 5));
        break;
      case 'PageUp':
        e.preventDefault();
        setActiveIndex((i) => nextEnabledIndex(filtered, Math.max(i, 0), -1, 5));
        break;
      case 'Home':
        if (!isSearchable) {
          e.preventDefault();
          setActiveIndex(firstEnabledIndex(filtered));
        }
        break;
      case 'End':
        if (!isSearchable) {
          e.preventDefault();
          setActiveIndex(lastEnabledIndex(filtered));
        }
        break;
      case 'Enter':
        e.preventDefault();
        choose(activeIndex);
        break;
      case 'Escape':
        e.preventDefault();
        e.stopPropagation(); // don't also close a surrounding dialog
        closeList(true);
        break;
      case 'Tab':
        closeList(false);
        break;
      default:
        if (!isSearchable && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const ta = typeAhead.current;
          window.clearTimeout(ta.timer);
          ta.text += e.key;
          ta.timer = window.setTimeout(() => (ta.text = ''), TYPEAHEAD_RESET_MS);
          const match = typeAheadIndex(filtered, ta.text, ta.text.length > 1 ? activeIndex - 1 : activeIndex);
          if (match >= 0) setActiveIndex(match);
        }
    }
  };

  const handleTriggerKeys = (e: KeyboardEvent) => {
    // If focus is still on the trigger while open (panel not focused yet), keys still drive the list.
    if (open) {
      handleListKeys(e);
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      openList();
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Typing on a closed dropdown opens it with the search seeded (or jumps via type-ahead).
      e.preventDefault();
      if (isSearchable) openList(e.key);
      else {
        openList();
        const match = typeAheadIndex(options, e.key, Math.max(options.findIndex((o) => o.value === value), -1));
        if (match >= 0) setActiveIndex(match);
      }
    }
  };

  const showClear = clearable && selected && !disabled;
  const activeDescendant = open && activeIndex >= 0 && filtered[activeIndex] ? optionId(activeIndex) : undefined;

  return (
    <div className={cn('relative', wrapperClassName ?? 'w-full')}>
      <button
        ref={setTriggerRef}
        id={triggerId}
        name={name}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-invalid={invalid || undefined}
        aria-label={aria['aria-label']}
        aria-labelledby={aria['aria-labelledby']}
        aria-describedby={aria['aria-describedby']}
        aria-required={aria['aria-required']}
        disabled={disabled}
        onClick={() => (open ? closeList(true) : openList())}
        onKeyDown={handleTriggerKeys}
        onBlur={(e) => {
          if (!open && !panelRef.current?.contains(e.relatedTarget as Node)) onBlur?.();
        }}
        className={controlClass(
          invalid,
          cn('flex items-center gap-2 text-left cursor-pointer', showClear ? 'pr-16' : 'pr-9', className),
          highlighted,
        )}
      >
        {selected?.icon && <span className="shrink-0 text-zinc-500 [&>svg]:w-4 [&>svg]:h-4">{selected.icon}</span>}
        <span className={cn('flex-1 truncate', !selected && 'text-zinc-400')}>{selected?.label ?? placeholder}</span>
      </button>

      {showClear && (
        <button
          type="button"
          aria-label="Clear selection"
          onClick={() => {
            onChange(null);
            triggerRef.current?.focus();
          }}
          className="absolute right-8 top-1/2 -translate-y-1/2 w-6 h-6 inline-flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
      <CaretDown
        aria-hidden
        className={cn(
          'pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 transition-transform',
          open && 'rotate-180',
        )}
      />

      {open &&
        position &&
        createPortal(
          <div
            ref={panelRef}
            style={{ left: position.left, width: position.width, top: position.top, bottom: position.bottom }}
            className="fixed z-[70] min-w-40 bg-white border border-zinc-200 rounded-md overflow-hidden flex flex-col"
          >
            {isSearchable && (
              <div className="p-2 border-b border-zinc-100">
                <div className="relative">
                  <MagnifyingGlass aria-hidden className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    ref={searchRef}
                    type="text"
                    role="combobox"
                    aria-expanded
                    aria-controls={listId}
                    aria-autocomplete="list"
                    aria-activedescendant={activeDescendant}
                    aria-label={searchPlaceholder}
                    placeholder={searchPlaceholder}
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setActiveIndex(firstEnabledIndex(options.filter((o) => matchesQuery(o, e.target.value))));
                    }}
                    onKeyDown={handleListKeys}
                    className="w-full h-9 pl-8 pr-2 rounded-md border border-zinc-200 bg-zinc-50 text-sm outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>
              </div>
            )}

            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              tabIndex={-1}
              aria-labelledby={aria['aria-labelledby']}
              aria-label={aria['aria-labelledby'] ? undefined : aria['aria-label'] ?? placeholder}
              aria-activedescendant={isSearchable ? undefined : activeDescendant}
              onKeyDown={isSearchable ? undefined : handleListKeys}
              style={{ maxHeight: Math.max(120, position.maxHeight - (isSearchable ? 54 : 0)) }}
              className="overflow-y-auto p-1 outline-none"
            >
              {filtered.length === 0 && <li className="px-3 py-6 text-center text-sm text-zinc-400">{emptyMessage}</li>}
              {filtered.map((option, index) => {
                const isSelected = option.value === value;
                const isActive = index === activeIndex;
                return (
                  // Keyboard selection is handled on the listbox / search input via aria-activedescendant.
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                  <li
                    key={String(option.value)}
                    id={optionId(index)}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled || undefined}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                    onClick={() => choose(index)}
                    className={cn(
                      'flex items-center gap-2 px-2.5 py-2 rounded-md text-sm select-none',
                      option.disabled ? 'text-zinc-300 cursor-not-allowed' : 'text-zinc-800 cursor-pointer',
                      isActive && !option.disabled && 'bg-red-50 text-red-700',
                    )}
                  >
                    {option.icon && <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4">{option.icon}</span>}
                    <span className="flex-1 min-w-0">
                      <span className={cn('block truncate', isSelected && 'font-semibold')}>{option.label}</span>
                      {option.description && <span className="block text-xs text-zinc-500 truncate">{option.description}</span>}
                    </span>
                    {isSelected && <Check aria-hidden className="w-4 h-4 text-red-600 shrink-0" />}
                  </li>
                );
              })}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}

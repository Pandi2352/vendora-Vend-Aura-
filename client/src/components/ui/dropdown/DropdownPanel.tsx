import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Check, MagnifyingGlass } from '@phosphor-icons/react';
import { cn } from '../cn';
import { Spinner } from '../Spinner';
import { positionStyle } from '../overlay/useAnchoredPosition';
import type { DropdownState } from './useDropdown';
import type { DropdownValue } from './dropdown-utils';

interface DropdownPanelProps<V extends DropdownValue> {
  state: DropdownState<V>;
  isSelected: (value: V) => boolean;
  /** Checkbox marks instead of a trailing tick (multi-select). */
  multiple?: boolean;
  searchPlaceholder: string;
  emptyMessage: string;
  loading?: boolean;
  listLabel?: string;
  listLabelledBy?: string;
  /** Extra row above / below the options (e.g. "Select all"). */
  header?: ReactNode;
  footer?: ReactNode;
}

/** Floating list for Dropdown / MultiSelect: optional search, options, empty / loading states. */
export function DropdownPanel<V extends DropdownValue>({
  state,
  isSelected,
  multiple = false,
  searchPlaceholder,
  emptyMessage,
  loading = false,
  listLabel,
  listLabelledBy,
  header,
  footer,
}: DropdownPanelProps<V>) {
  const { open, position, refs, ids, isSearchable, filtered, activeIndex, activeDescendant } = state;
  if (!open || !position) return null;

  return createPortal(
    <div
      ref={refs.panelRef}
      style={positionStyle(position)}
      className="fixed z-[70] min-w-40 bg-white border border-zinc-200 rounded-md overflow-hidden flex flex-col"
    >
      {isSearchable && (
        <div className="p-2 border-b border-zinc-100">
          <div className="relative">
            <MagnifyingGlass aria-hidden className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              ref={refs.searchRef}
              type="text"
              role="combobox"
              aria-expanded
              aria-controls={ids.listId}
              aria-autocomplete="list"
              aria-activedescendant={activeDescendant}
              aria-label={searchPlaceholder}
              placeholder={searchPlaceholder}
              value={state.query}
              onChange={(e) => state.setQuery(e.target.value)}
              onKeyDown={state.handleListKeys}
              className="w-full h-9 pl-8 pr-8 rounded-md border border-zinc-200 bg-zinc-50 text-sm outline-none focus:border-primary-600 focus:bg-white"
            />
            {loading && <Spinner size="sm" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400" label="Loading options" />}
          </div>
        </div>
      )}
      {header}

      <ul
        ref={refs.listRef}
        id={ids.listId}
        role="listbox"
        tabIndex={-1}
        aria-multiselectable={multiple || undefined}
        aria-labelledby={listLabelledBy}
        aria-label={listLabelledBy ? undefined : listLabel}
        aria-activedescendant={isSearchable ? undefined : activeDescendant}
        aria-busy={loading || undefined}
        onKeyDown={isSearchable ? undefined : state.handleListKeys}
        style={{ maxHeight: Math.max(120, position.maxHeight - (isSearchable ? 54 : 0)) }}
        className="overflow-y-auto p-1 outline-none"
      >
        {filtered.length === 0 && (
          <li className="px-3 py-6 text-center text-sm text-zinc-400">{loading ? 'Loading…' : emptyMessage}</li>
        )}
        {filtered.map((option, index) => {
          const selected = isSelected(option.value);
          const active = index === activeIndex;
          return (
            // Keyboard selection is handled on the listbox / search input via aria-activedescendant.
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <li
              key={String(option.value)}
              id={ids.optionId(index)}
              role="option"
              aria-selected={selected}
              aria-disabled={option.disabled || undefined}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => !option.disabled && state.setActiveIndex(index)}
              onClick={() => state.choose(index)}
              className={cn(
                'flex items-center gap-2 px-2.5 py-2 rounded-md text-sm select-none',
                option.disabled ? 'text-zinc-300 cursor-not-allowed' : 'text-zinc-800 cursor-pointer',
                active && !option.disabled && 'bg-primary-50 text-primary-700',
              )}
            >
              {multiple && (
                <span
                  aria-hidden
                  className={cn(
                    'w-4 h-4 rounded-md border shrink-0 inline-flex items-center justify-center',
                    selected ? 'bg-primary-600 border-primary-600 text-white' : 'border-zinc-300 bg-white',
                  )}
                >
                  {selected && <Check weight="bold" className="w-3 h-3" />}
                </span>
              )}
              {option.icon && <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4">{option.icon}</span>}
              <span className="flex-1 min-w-0">
                <span className={cn('block truncate', selected && 'font-semibold')}>{option.label}</span>
                {option.description && <span className="block text-xs text-zinc-500 truncate">{option.description}</span>}
              </span>
              {!multiple && selected && <Check aria-hidden className="w-4 h-4 text-primary-600 shrink-0" />}
            </li>
          );
        })}
      </ul>
      {footer}
    </div>,
    document.body,
  );
}

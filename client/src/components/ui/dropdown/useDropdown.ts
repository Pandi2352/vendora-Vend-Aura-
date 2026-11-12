import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type React from 'react';
import { useAnchoredPosition } from '../overlay/useAnchoredPosition';
import {
  firstEnabledIndex,
  lastEnabledIndex,
  matchesQuery,
  nextEnabledIndex,
  typeAheadIndex,
  type DropdownOption,
  type DropdownValue,
} from './dropdown-utils';

const TYPEAHEAD_RESET_MS = 600;

export interface UseDropdownOptions<V extends DropdownValue> {
  options: DropdownOption<V>[];
  /** Selected state of a value (single: equals value; multi: included). */
  isSelected: (value: V) => boolean;
  /** Called when an option is chosen. Return true to keep the list open (multi-select). */
  onPick: (option: DropdownOption<V>) => boolean | void;
  onBlur?: () => void;
  disabled?: boolean;
  searchable?: boolean;
  /** Server-side search: called with the query; options are not filtered locally. */
  onSearch?: (query: string) => void;
  id?: string;
  /** Whole control (trigger + chips…); clicks inside it don't count as "outside". */
  containerRef?: React.RefObject<HTMLElement | null>;
}

/**
 * State + keyboard model shared by Dropdown and MultiSelect: open/close,
 * active option, search, type-ahead, outside click, focus handling, position.
 */
export function useDropdown<V extends DropdownValue>({
  options,
  isSelected,
  onPick,
  onBlur,
  disabled,
  searchable,
  onSearch,
  id,
  containerRef,
}: UseDropdownOptions<V>) {
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
  const [query, setQueryState] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const isSearchable = searchable ?? (onSearch !== undefined || options.length > 7);
  const filtered = useMemo(
    () => (isSearchable && query && !onSearch ? options.filter((o) => matchesQuery(o, query)) : options),
    [options, query, isSearchable, onSearch],
  );
  const position = useAnchoredPosition(triggerRef, open, { matchWidth: true });

  const setQuery = (next: string) => {
    setQueryState(next);
    onSearch?.(next);
    const list = onSearch ? options : options.filter((o) => matchesQuery(o, next));
    setActiveIndex(firstEnabledIndex(list));
  };

  const openList = (seedQuery = '') => {
    if (disabled) return;
    setQueryState(seedQuery);
    if (seedQuery) onSearch?.(seedQuery);
    const list = seedQuery && isSearchable && !onSearch ? options.filter((o) => matchesQuery(o, seedQuery)) : options;
    const selectedIndex = list.findIndex((o) => isSelected(o.value) && !o.disabled);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : firstEnabledIndex(list));
    setOpen(true);
  };

  const closeList = (refocus: boolean) => {
    setOpen(false);
    setQueryState('');
    if (refocus) triggerRef.current?.focus();
    onBlur?.();
  };

  const choose = (index: number) => {
    const option = filtered[index];
    if (!option || option.disabled) return;
    const keepOpen = onPick(option);
    if (!keepOpen) closeList(true);
  };

  // The panel renders once its position is measured; then move focus into it.
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

  // Close on outside pointer down (closeList reads current props at call time).
  const closeRef = useRef(closeList);
  closeRef.current = closeList;
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      const inside =
        panelRef.current?.contains(target) || triggerRef.current?.contains(target) || containerRef?.current?.contains(target);
      if (!inside) closeRef.current(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, containerRef]);

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
      case ' ':
        // Space toggles in a list without search (in search, it types a space).
        if (!isSearchable) {
          e.preventDefault();
          choose(activeIndex);
        }
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
    // Focus can still be on the trigger while open (panel not focused yet).
    if (open) {
      handleListKeys(e);
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      openList();
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      if (isSearchable) openList(e.key);
      else {
        openList();
        const from = options.findIndex((o) => isSelected(o.value));
        const match = typeAheadIndex(options, e.key, Math.max(from, -1));
        if (match >= 0) setActiveIndex(match);
      }
    }
  };

  return {
    ids: { triggerId, listId, optionId },
    refs: { triggerRef, panelRef, searchRef, listRef },
    open,
    position,
    query,
    setQuery,
    filtered,
    activeIndex,
    setActiveIndex,
    isSearchable,
    activeDescendant: open && activeIndex >= 0 && filtered[activeIndex] ? optionId(activeIndex) : undefined,
    openList,
    closeList,
    choose,
    handleListKeys,
    handleTriggerKeys,
  };
}

export type DropdownState<V extends DropdownValue> = ReturnType<typeof useDropdown<V>>;

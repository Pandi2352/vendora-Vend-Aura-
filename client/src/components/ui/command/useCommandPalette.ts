import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { filterCommands, firstEnabled, lastEnabled, wrapEnabled, type CommandGroup } from './command-utils';

/**
 * Query, filtered results and the active option of an open palette. Lives in the
 * dialog body, which unmounts on close, so the query clears automatically.
 */
export function useCommandPalette(groups: CommandGroup[], listId: string, close: () => void) {
  const [query, setQuery] = useState('');
  const { groups: visible, flat } = useMemo(() => filterCommands(groups, query), [groups, query]);
  const [activeIndex, setActiveIndex] = useState(() => firstEnabled(flat));

  const changeQuery = (next: string) => {
    setQuery(next);
    setActiveIndex(firstEnabled(filterCommands(groups, next).flat));
  };

  const optionId = (index: number) => `${listId}-option-${index}`;
  const active = activeIndex >= 0 && activeIndex < flat.length ? activeIndex : -1;

  useEffect(() => {
    if (active >= 0) document.getElementById(optionId(active))?.scrollIntoView?.({ block: 'nearest' });
    // optionId is derived from listId, which is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const select = (index: number) => {
    const match = flat[index];
    if (!match || match.item.disabled) return;
    close();
    match.item.onSelect();
  };

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const move = (index: number) => {
      e.preventDefault();
      if (index >= 0) setActiveIndex(index);
    };
    switch (e.key) {
      case 'ArrowDown':
        return move(wrapEnabled(flat, active, 1));
      case 'ArrowUp':
        return move(wrapEnabled(flat, active < 0 ? flat.length : active, -1));
      case 'Home':
        return move(firstEnabled(flat));
      case 'End':
        return move(lastEnabled(flat));
      case 'Enter':
        e.preventDefault();
        return select(active);
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        return close();
      case 'Tab':
        // Only the input is focusable inside the palette.
        e.preventDefault();
    }
  };

  const hover = (index: number) => {
    if (!flat[index]?.item.disabled) setActiveIndex(index);
  };

  return { query, changeQuery, visible, flat, active, optionId, select, hover, onInputKeyDown };
}

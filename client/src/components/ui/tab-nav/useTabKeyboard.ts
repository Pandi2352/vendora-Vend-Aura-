import type { KeyboardEvent, RefObject } from 'react';
import { findTab, type TabOption } from './types';

/** Arrow / Home / End keys move between enabled tabs (WAI-ARIA tabs pattern). */
export function useTabKeyboard<T extends string>(
  items: TabOption<T>[],
  value: T,
  onChange: (value: T) => void,
  listRef: RefObject<HTMLDivElement | null>,
) {
  return (event: KeyboardEvent<HTMLElement>) => {
    const enabled = items.filter((item) => !item.disabled);
    const index = enabled.findIndex((item) => item.value === value);
    const last = enabled.length - 1;
    const moves: Record<string, number> = {
      ArrowRight: index >= last ? 0 : index + 1,
      ArrowLeft: index <= 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    const next = enabled[moves[event.key] ?? -1];
    if (!next) return;
    event.preventDefault();
    onChange(next.value);
    findTab(listRef.current, next.value)?.focus();
  };
}

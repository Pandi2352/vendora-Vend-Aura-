import type { ReactNode } from 'react';

export interface CommandItem {
  id: string;
  label: string;
  /** Extra search terms (synonyms, parent section, ...). */
  keywords?: string[];
  icon?: ReactNode;
  /** Keyboard hint shown on the right, e.g. "Ctrl+P". */
  shortcut?: string;
  description?: string;
  disabled?: boolean;
  onSelect: () => void;
}

export interface CommandGroup {
  heading: string;
  items: CommandItem[];
}

export interface CommandMatch {
  item: CommandItem;
  /** Position in the flat result list (keyboard order). */
  index: number;
  /** Matched range in the label, for highlighting. */
  range: [number, number] | null;
}

export interface FilteredGroup {
  heading: string;
  matches: CommandMatch[];
}

/** 0 = label starts with query, 1 = label contains it, 2 = a keyword contains it; null = no match. */
function rank(item: CommandItem, q: string): number | null {
  const label = item.label.toLowerCase();
  const at = label.indexOf(q);
  if (at === 0) return 0;
  if (at > 0) return 1;
  if (item.keywords?.some((k) => k.toLowerCase().includes(q))) return 2;
  return null;
}

/**
 * Case-insensitive substring filter over label + keywords. Within each group,
 * label-prefix matches come first, then other label matches, then keyword
 * matches (stable otherwise). Groups with no matches are dropped.
 */
export function filterCommands(groups: CommandGroup[], query: string) {
  const q = query.trim().toLowerCase();
  const flat: CommandMatch[] = [];
  const result: FilteredGroup[] = [];

  for (const group of groups) {
    const ranked = group.items
      .map((item, order) => ({ item, order, rank: q ? rank(item, q) : 0 }))
      .filter((r): r is { item: CommandItem; order: number; rank: number } => r.rank !== null)
      .sort((a, b) => a.rank - b.rank || a.order - b.order);
    if (ranked.length === 0) continue;
    const matches = ranked.map(({ item }) => {
      const at = q ? item.label.toLowerCase().indexOf(q) : -1;
      const match: CommandMatch = { item, index: flat.length, range: at >= 0 ? [at, at + q.length] : null };
      flat.push(match);
      return match;
    });
    result.push({ heading: group.heading, matches });
  }
  return { groups: result, flat };
}

/** Next enabled index in `direction`, wrapping; -1 when nothing is enabled. */
export function wrapEnabled(flat: CommandMatch[], from: number, direction: 1 | -1) {
  const n = flat.length;
  for (let step = 1; step <= n; step++) {
    const index = (((from + direction * step) % n) + n) % n;
    if (!flat[index].item.disabled) return index;
  }
  return -1;
}

export const firstEnabled = (flat: CommandMatch[]) => wrapEnabled(flat, -1, 1);
export const lastEnabled = (flat: CommandMatch[]) => wrapEnabled(flat, flat.length, -1);

/** True on macOS / iOS, where the palette hotkey is Cmd+K. */
export const isApplePlatform = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

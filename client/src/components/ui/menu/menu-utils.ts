import type { ReactNode } from 'react';

export interface MenuActionItem {
  type?: 'item';
  label: string;
  icon?: ReactNode;
  onSelect?: () => void;
  /** Renders the item as a link. */
  href?: string;
  /** Red text for destructive actions (delete, void). */
  danger?: boolean;
  disabled?: boolean;
  /** Keyboard hint shown on the right, e.g. "Ctrl+P". */
  shortcut?: string;
  /** Smaller second line under the label. */
  description?: string;
}

export interface MenuSeparator {
  type: 'separator';
}

/** Starts a labelled group; items after it (until the next label) belong to it. */
export interface MenuGroupLabel {
  type: 'label';
  label: string;
}

export type MenuEntry = MenuActionItem | MenuSeparator | MenuGroupLabel;

export const isActionItem = (entry: MenuEntry): entry is MenuActionItem => !entry.type || entry.type === 'item';

export interface MenuSection {
  label?: string;
  entries: { entry: MenuActionItem | MenuSeparator; itemIndex: number }[];
}

/**
 * Splits entries into groups (one per label) and numbers the action items
 * 0..n-1 so keyboard focus can move over a flat list.
 */
export function buildMenu(entries: MenuEntry[]) {
  const sections: MenuSection[] = [{ entries: [] }];
  const items: MenuActionItem[] = [];
  for (const entry of entries) {
    if (entry.type === 'label') sections.push({ label: entry.label, entries: [] });
    else if (entry.type === 'separator') sections[sections.length - 1].entries.push({ entry, itemIndex: -1 });
    else {
      sections[sections.length - 1].entries.push({ entry, itemIndex: items.length });
      items.push(entry);
    }
  }
  return { sections: sections.filter((s) => s.label || s.entries.length), items };
}

/** Next enabled item in `direction`, wrapping around (APG menu behaviour). */
export function wrapEnabledIndex(items: MenuActionItem[], from: number, direction: 1 | -1) {
  const n = items.length;
  for (let step = 1; step <= n; step++) {
    const index = (((from + direction * step) % n) + n) % n;
    if (!items[index].disabled) return index;
  }
  return -1;
}

export const firstEnabledItem = (items: MenuActionItem[]) => wrapEnabledIndex(items, -1, 1);
export const lastEnabledItem = (items: MenuActionItem[]) => wrapEnabledIndex(items, items.length, -1);

/** First enabled item after `from` whose label starts with `prefix` (wraps). */
export function typeAheadItem(items: MenuActionItem[], prefix: string, from: number) {
  const p = prefix.toLowerCase();
  const n = items.length;
  for (let step = 1; step <= n; step++) {
    const index = (from + step + n) % n;
    if (!items[index].disabled && items[index].label.toLowerCase().startsWith(p)) return index;
  }
  return -1;
}

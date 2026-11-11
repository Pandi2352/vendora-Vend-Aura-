import type { ReactNode } from 'react';

export type DropdownValue = string | number;

export interface DropdownOption<V extends DropdownValue = string> {
  value: V;
  label: string;
  /** Smaller second line under the label. */
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

/** Next enabled option index in `direction`, clamped to the list (no wrap). */
export function nextEnabledIndex<V extends DropdownValue>(
  options: DropdownOption<V>[],
  from: number,
  direction: 1 | -1,
  steps = 1,
): number {
  let index = from;
  let moved = 0;
  let lastEnabled = from;
  while (moved < steps) {
    const next = index + direction;
    if (next < 0 || next >= options.length) break;
    index = next;
    if (!options[index].disabled) {
      lastEnabled = index;
      moved++;
    }
  }
  return lastEnabled;
}

export const firstEnabledIndex = <V extends DropdownValue>(options: DropdownOption<V>[]) =>
  options.findIndex((o) => !o.disabled);

export function lastEnabledIndex<V extends DropdownValue>(options: DropdownOption<V>[]) {
  for (let i = options.length - 1; i >= 0; i--) if (!options[i].disabled) return i;
  return -1;
}

/** Case-insensitive match on label + description. */
export const matchesQuery = <V extends DropdownValue>(option: DropdownOption<V>, query: string) => {
  const q = query.trim().toLowerCase();
  return !q || `${option.label} ${option.description ?? ''}`.toLowerCase().includes(q);
};

/** Type-ahead: first enabled option whose label starts with `prefix`, searching after `from`. */
export function typeAheadIndex<V extends DropdownValue>(options: DropdownOption<V>[], prefix: string, from: number) {
  const p = prefix.toLowerCase();
  const n = options.length;
  for (let i = 1; i <= n; i++) {
    const idx = (from + i) % n;
    const o = options[idx];
    if (!o.disabled && o.label.toLowerCase().startsWith(p)) return idx;
  }
  return -1;
}

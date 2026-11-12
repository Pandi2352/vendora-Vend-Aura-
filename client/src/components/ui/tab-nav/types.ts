import type { ComponentType, ReactNode } from 'react';

/** One tab, shared by SegmentedTabs and RailTabs. */
export interface TabOption<T extends string = string> {
  value: T;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  /** Second line under the label (SegmentedTabs). */
  description?: string;
  /** Small count or tag shown after the label. */
  badge?: ReactNode;
  disabled?: boolean;
}

export interface TabsBaseProps<T extends string> {
  items: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name of the tab list. */
  label: string;
  /** Prefix for tab / panel ids; a panel uses `tabPanelId(idPrefix, value)` as its id. */
  idPrefix?: string;
  className?: string;
}

export const tabId = (prefix: string, value: string) => `${prefix}-tab-${value}`;
export const tabPanelId = (prefix: string, value: string) => `${prefix}-panel-${value}`;

/** Finds a tab button inside a tab list by its value. */
export const findTab = (list: HTMLElement | null, value: string) =>
  list?.querySelector<HTMLElement>(`[data-tab="${CSS.escape(value)}"]`) ?? null;

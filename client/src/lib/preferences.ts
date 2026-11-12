export type ThemeMode = 'light' | 'dark';
export type UiSize = 'compact' | 'default' | 'large' | 'xlarge' | 'custom';
export type ReceiptWidth = '58mm' | '80mm';

export interface Preferences {
  theme: ThemeMode;
  uiSize: UiSize;
  /** Percentage used when uiSize is 'custom'. */
  customScale: number;
  sidebarCollapsed: boolean;
  kioskMode: boolean;
  autoPrintReceipt: boolean;
  receiptWidth: ReceiptWidth;
  defaultOpeningFloat: number;
}

export const UI_SIZE_OPTIONS: { value: UiSize; label: string; scale: number }[] = [
  { value: 'compact', label: 'Compact', scale: 87.5 },
  { value: 'default', label: 'Default', scale: 100 },
  { value: 'large', label: 'Large', scale: 112.5 },
  { value: 'xlarge', label: 'Extra Large', scale: 125 },
  { value: 'custom', label: 'Custom', scale: 100 },
];

export const CUSTOM_SCALE_RANGE = { min: 80, max: 140, step: 2.5 };

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'light',
  uiSize: 'compact',
  customScale: 100,
  sidebarCollapsed: false,
  kioskMode: false,
  autoPrintReceipt: false,
  receiptWidth: '80mm',
  defaultOpeningFloat: 2000,
};

const STORAGE_KEY = 'vendora_preferences';

/** Preferences are per device (stored locally), like the till itself. */
export function loadPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: Preferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* storage unavailable (private mode): keep in memory only */
  }
}

export function resolveScale(prefs: Preferences): number {
  if (prefs.uiSize === 'custom') return prefs.customScale;
  return UI_SIZE_OPTIONS.find((o) => o.value === prefs.uiSize)?.scale ?? 100;
}

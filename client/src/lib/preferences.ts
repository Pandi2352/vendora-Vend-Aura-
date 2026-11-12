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
  hasMigratedTo80Custom?: boolean;
}

export const UI_SIZE_OPTIONS: { value: UiSize; label: string; scale: number }[] = [
  { value: 'compact', label: 'Compact', scale: 87.5 },
  { value: 'default', label: 'Default', scale: 100 },
  { value: 'large', label: 'Large', scale: 112.5 },
  { value: 'xlarge', label: 'Extra Large', scale: 125 },
  { value: 'custom', label: 'Custom', scale: 80 },
];

export const CUSTOM_SCALE_RANGE = { min: 60, max: 140, step: 2.5 };

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'light',
  uiSize: 'custom',
  customScale: 80,
  sidebarCollapsed: false,
  kioskMode: false,
  autoPrintReceipt: false,
  receiptWidth: '80mm',
  defaultOpeningFloat: 2000,
  hasMigratedTo80Custom: true,
};

const STORAGE_KEY = 'vendora_preferences';

/** Preferences are per device (stored locally), like the till itself. */
export function loadPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    if (!parsed.hasMigratedTo80Custom) {
      return {
        ...DEFAULT_PREFERENCES,
        ...parsed,
        uiSize: 'custom',
        customScale: 80,
        hasMigratedTo80Custom: true,
      };
    }
    return { ...DEFAULT_PREFERENCES, ...parsed };
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
  return UI_SIZE_OPTIONS.find((o) => o.value === prefs.uiSize)?.scale ?? 80;
}

import { createContext } from 'react';
import type { ThemeConfig } from '../lib/theme';

export interface ThemeContextValue {
  config: ThemeConfig;
  setTheme: (patch: Partial<ThemeConfig>) => void;
  saveToBackend: (override?: Partial<ThemeConfig>) => Promise<boolean>;
  resetTheme: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);


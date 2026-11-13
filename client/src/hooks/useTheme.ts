import { useContext } from 'react';
import { ThemeContext, type ThemeContextValue } from '../context/ThemeContext';
import { DEFAULT_THEME_CONFIG } from '../lib/theme';

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      config: DEFAULT_THEME_CONFIG,
      setTheme: () => {},
      saveToBackend: async () => false,
      resetTheme: () => {},
      isSaving: false,
      hasUnsavedChanges: false,
    };
  }
  return ctx;
}


import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadPreferences, resolveScale, savePreferences, type Preferences } from '../../lib/preferences';
import { PreferencesContext } from './PreferencesContext';

export type { PreferencesContextValue } from './PreferencesContext';

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(loadPreferences);

  // Apply theme + UI scale to <html>, and persist on every change.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', prefs.theme === 'dark');
    root.style.setProperty('--ui-scale', `${resolveScale(prefs)}%`);
    savePreferences(prefs);
  }, [prefs]);

  const update = useCallback((patch: Partial<Preferences>) => setPrefs((p) => ({ ...p, ...patch })), []);
  const toggleTheme = useCallback(() => setPrefs((p) => ({ ...p, theme: p.theme === 'dark' ? 'light' : 'dark' })), []);
  const toggleSidebar = useCallback(() => setPrefs((p) => ({ ...p, sidebarCollapsed: !p.sidebarCollapsed })), []);

  const value = useMemo(
    () => ({ ...prefs, update, toggleTheme, toggleSidebar }),
    [prefs, update, toggleTheme, toggleSidebar],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

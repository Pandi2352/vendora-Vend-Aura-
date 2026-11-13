import { createContext } from 'react';
import type { Preferences } from '../../lib/preferences';

export interface PreferencesContextValue extends Preferences {
  update: (patch: Partial<Preferences>) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

export const PreferencesContext = createContext<PreferencesContextValue | null>(null);

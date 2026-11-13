import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  applyThemeToDom,
  DEFAULT_THEME_CONFIG,
  loadLocalTheme,
  saveLocalTheme,
  type ThemeConfig,
} from '../lib/theme';
import { api } from '../lib/api';
import { AuthContext } from '../app/providers/AuthContext';
import { ThemeContext } from './ThemeContext';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const [config, setConfigState] = useState<ThemeConfig>(loadLocalTheme);
  const [serverConfig, setServerConfig] = useState<ThemeConfig>(loadLocalTheme);
  const [isSaving, setIsSaving] = useState(false);

  // Apply to DOM on state update & save to localStorage for instant cache
  useEffect(() => {
    applyThemeToDom(config);
    saveLocalTheme(config);
  }, [config]);

  // Load tenant's persisted theme from backend on auth
  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    api
      .get<{ data: Partial<ThemeConfig> }>('/account/theme')
      .then((res) => {
        if (!isMounted || !res.data?.data) return;
        const remote = { ...DEFAULT_THEME_CONFIG, ...res.data.data };
        setConfigState((prev) => ({ ...prev, ...remote }));
        setServerConfig(remote);
      })
      .catch(() => {
        // Fallback to local cache if offline or unauthenticated
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const setTheme = useCallback((patch: Partial<ThemeConfig>) => {
    setConfigState((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetTheme = useCallback(() => {
    setConfigState(DEFAULT_THEME_CONFIG);
  }, []);

  const saveToBackend = useCallback(
    async (override?: Partial<ThemeConfig>): Promise<boolean> => {
      const target = { ...config, ...(override || {}) };
      setIsSaving(true);
      try {
        const res = await api.patch<{ data: ThemeConfig }>('/account/theme', target);
        if (res.data?.data) {
          setServerConfig(res.data.data);
          setConfigState(res.data.data);
        }
        return true;
      } catch {
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [config],
  );

  const hasUnsavedChanges = useMemo(() => {
    return (
      config.themeId !== serverConfig.themeId ||
      config.sidebarStyle !== serverConfig.sidebarStyle ||
      config.navbarStyle !== serverConfig.navbarStyle ||
      config.fontFamily !== serverConfig.fontFamily ||
      config.borderRadius !== serverConfig.borderRadius ||
      config.surfaceStyle !== serverConfig.surfaceStyle ||
      config.accentIntensity !== serverConfig.accentIntensity ||
      config.tableStriping !== serverConfig.tableStriping
    );
  }, [config, serverConfig]);

  const value = useMemo(
    () => ({
      config,
      setTheme,
      saveToBackend,
      resetTheme,
      isSaving,
      hasUnsavedChanges,
    }),
    [config, setTheme, saveToBackend, resetTheme, isSaving, hasUnsavedChanges],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

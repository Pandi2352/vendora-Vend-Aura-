import { useEffect } from 'react';
import { usePreferences } from './usePreferences';

/** Kiosk mode: browser asks before the till tab is closed or reloaded. */
export function useKioskGuard() {
  const { kioskMode } = usePreferences();

  useEffect(() => {
    if (!kioskMode) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [kioskMode]);
}

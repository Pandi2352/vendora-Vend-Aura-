import { useState, useCallback, useEffect } from 'react';
import { api, unwrap } from '../lib/api';
import type { ShiftSummary } from '../types/shift-return.types';

export function useDrawerShift(enabled: boolean) {
  const [activeShift, setActiveShift] = useState<ShiftSummary | null>(null);

  const fetchShift = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await api.get('/orders/shifts/current');
      setActiveShift(unwrap<ShiftSummary | null>(res) || null);
    } catch (err) {
      console.error('Failed to load current cash-drawer shift:', err);
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) {
      fetchShift();
    } else {
      setActiveShift(null);
    }
  }, [enabled, fetchShift]);

  return {
    activeShift,
    setActiveShift,
    refreshShift: fetchShift,
  };
}

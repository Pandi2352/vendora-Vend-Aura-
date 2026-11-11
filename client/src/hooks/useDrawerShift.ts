import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import type { ShiftSummary } from '../types/shift-return.types';

const API_BASE = 'http://localhost:5000/api/v1';

export function useDrawerShift(tenantId?: string) {
  const [activeShift, setActiveShift] = useState<ShiftSummary | null>(null);
  const [isLoadingShift, setIsLoadingShift] = useState(false);

  const fetchShift = useCallback(async () => {
    if (!tenantId) return;
    setIsLoadingShift(true);
    try {
      const res = await axios.get(`${API_BASE}/orders/shifts/current?tenantId=${tenantId}`);
      setActiveShift(res.data?.data || null);
    } catch {
      // silently handle
    } finally {
      setIsLoadingShift(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchShift();
  }, [fetchShift]);

  return {
    activeShift,
    setActiveShift,
    isLoadingShift,
    refreshShift: fetchShift,
  };
}


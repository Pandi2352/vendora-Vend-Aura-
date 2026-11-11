import { useCallback, useEffect, useState } from 'react';
import type { AxiosResponse } from 'axios';
import { api, unwrap } from '../../lib/api';
import type { OrderItemRecord } from '../../types/pos.types';
import type { ExecutiveOverviewData, InventoryValuationData } from '../../types/reports.types';

interface DashboardData {
  recentOrders: OrderItemRecord[];
  today: ExecutiveOverviewData | null;
  inventory: InventoryValuationData | null;
}

const RECENT_BILLS = 6;

/** Loads dashboard widgets in parallel; report widgets only for roles that can see reports. */
export function useDashboardData(canSeeReports: boolean) {
  const [data, setData] = useState<DashboardData>({ recentOrders: [], today: null, inventory: null });
  const [isLoading, setIsLoading] = useState(true);
  const [failed, setFailed] = useState<string[]>([]);

  const load = useCallback(async () => {
    setIsLoading(true);
    const requests: Array<Promise<AxiosResponse> | null> = [
      api.get('/orders', { params: { limit: RECENT_BILLS } }),
      canSeeReports ? api.get('/reports/executive', { params: { period: 'today' } }) : null,
      canSeeReports ? api.get('/reports/inventory') : null,
    ];
    const [orders, today, inventory] = await Promise.allSettled(requests.map((r) => r ?? Promise.resolve(null)));

    const errors: string[] = [];
    const pick = <T,>(result: PromiseSettledResult<AxiosResponse | null>, label: string): T | null => {
      if (result.status === 'rejected') {
        errors.push(label);
        return null;
      }
      return result.value ? unwrap<T>(result.value) : null;
    };

    setData({
      recentOrders: pick<OrderItemRecord[]>(orders, 'recent bills') ?? [],
      today: pick<ExecutiveOverviewData>(today, "today's sales"),
      inventory: pick<InventoryValuationData>(inventory, 'stock alerts'),
    });
    setFailed(errors);
    setIsLoading(false);
  }, [canSeeReports]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...data, isLoading, failed, reload: load };
}

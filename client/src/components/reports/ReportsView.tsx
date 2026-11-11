import { useState, useEffect, useCallback } from 'react';
import type { AxiosResponse } from 'axios';
import { api, unwrap, getErrorMessage } from '../../lib/api';
import {
  ChartLineUp,
  Receipt,
  Warehouse,
  ArrowClockwise,
  CalendarBlank,
} from '@phosphor-icons/react';
import type {
  ReportPeriod,
  ExecutiveOverviewData,
  Gstr1Data,
  Gstr3bData,
  InventoryValuationData,
} from '../../types/reports.types';
import { ExecutiveOverviewTab } from './ExecutiveOverviewTab';
import { GstReportsTab } from './GstReportsTab';
import { InventoryAnalyticsTab } from './InventoryAnalyticsTab';

type SubTab = 'overview' | 'gst' | 'inventory';

const PERIOD_LABELS: { key: ReportPeriod; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'fy', label: 'This FY' },
  { key: 'all', label: 'All Time' },
];

export function ReportsView() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('overview');
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [executiveData, setExecutiveData] = useState<ExecutiveOverviewData | null>(null);
  const [gstr1Data, setGstr1Data] = useState<Gstr1Data | null>(null);
  const [gstr3bData, setGstr3bData] = useState<Gstr3bData | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryValuationData | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    const params = { period };
    const [execRes, g1Res, g3bRes, invRes] = await Promise.allSettled([
      api.get('/reports/executive', { params }),
      api.get('/reports/gst/gstr-1', { params }),
      api.get('/reports/gst/gstr-3b', { params }),
      api.get('/reports/inventory'),
    ]);

    const failed: string[] = [];
    const take = <T,>(r: PromiseSettledResult<AxiosResponse>, label: string, set: (v: T | null) => void) => {
      if (r.status === 'fulfilled') {
        set(unwrap<T>(r.value) ?? null);
      } else {
        console.error(`Failed to load ${label} report:`, r.reason);
        failed.push(`${label}: ${getErrorMessage(r.reason)}`);
      }
    };
    take<ExecutiveOverviewData>(execRes, 'Executive overview', setExecutiveData);
    take<Gstr1Data>(g1Res, 'GSTR-1', setGstr1Data);
    take<Gstr3bData>(g3bRes, 'GSTR-3B', setGstr3bData);
    take<InventoryValuationData>(invRes, 'Inventory', setInventoryData);

    setLoadError(failed.join(' | '));
    setIsLoading(false);
  }, [period]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-zinc-50">
      {/* Top Header / Switcher Bar */}
      <div className="bg-white border-b border-zinc-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <ChartLineUp weight="bold" className="w-5 h-5 text-red-600" />
          <h1 className="text-base font-bold text-zinc-900 tracking-tight">Analytics & Business Intelligence</h1>
          <span className="text-xs text-zinc-400 hidden sm:inline">| Live Ledger & GST Records</span>
        </div>

        {/* Period Selector & Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-100 border border-zinc-200 rounded-md p-0.5 text-xs">
            <CalendarBlank weight="bold" className="w-3.5 h-3.5 text-zinc-400 mx-2" />
            {PERIOD_LABELS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-2.5 py-1 rounded-sm font-semibold transition-colors cursor-pointer ${
                  period === p.key
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchReports}
            disabled={isLoading}
            className="p-1.5 text-zinc-500 hover:text-zinc-900 border border-zinc-200 rounded-md hover:bg-zinc-100 transition-colors cursor-pointer"
            title="Refresh analytics data"
          >
            <ArrowClockwise weight="bold" className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="bg-zinc-950 px-6 py-2 border-b border-zinc-800 flex items-center gap-2 shrink-0">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
            activeSubTab === 'overview'
              ? 'bg-red-600 text-white'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <ChartLineUp weight="bold" className="w-3.5 h-3.5" />
          <span>Executive Overview & P&L</span>
        </button>

        <button
          onClick={() => setActiveSubTab('gst')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
            activeSubTab === 'gst'
              ? 'bg-red-600 text-white'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Receipt weight="bold" className="w-3.5 h-3.5" />
          <span>GST Reports (GSTR-1 & 3B)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
            activeSubTab === 'inventory'
              ? 'bg-red-600 text-white'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Warehouse weight="bold" className="w-3.5 h-3.5" />
          <span>Stock Valuation & Velocity</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {loadError && (
            <div className="mb-4 p-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {loadError}
            </div>
          )}
          {activeSubTab === 'overview' && (
            <ExecutiveOverviewTab data={executiveData} isLoading={isLoading} />
          )}
          {activeSubTab === 'gst' && (
            <GstReportsTab gstr1={gstr1Data} gstr3b={gstr3bData} isLoading={isLoading} />
          )}
          {activeSubTab === 'inventory' && (
            <InventoryAnalyticsTab data={inventoryData} isLoading={isLoading} />
          )}
        </div>
      </div>
    </div>
  );
}


import { useState, useEffect, useCallback } from 'react';
import {
  Vault,
  ArrowClockwise,
  CheckCircle,
  Clock,
  Eye,
  X,
} from '@phosphor-icons/react';
import { api, unwrap, getErrorMessage } from '../../lib/api';
import { formatDateTime, formatInr } from '@/utils';
import { usePosSession } from '../../hooks/usePosSession';

interface ShiftRecord {
  _id: string;
  shiftNumber: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  openingFloat: number;
  expectedCash: number;
  actualCashCounted: number;
  variance: number;
  cashSalesTotal: number;
  upiSalesTotal: number;
  cardSalesTotal: number;
  creditSalesTotal: number;
  refundsTotal: number;
  billsCount: number;
  status: 'OPEN' | 'CLOSED';
  notes?: string;
}

export function DailyShiftsTab() {
  const { isShiftOpen, activeShift, setOpenModal } = usePosSession();
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedShift, setSelectedShift] = useState<ShiftRecord | null>(null);

  const fetchShifts = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.get('/orders/shifts/history', { params: { limit: 50 } });
      const data = unwrap<ShiftRecord[] | { data: ShiftRecord[] }>(res);
      const items = Array.isArray(data) ? data : (data?.data || []);
      setShifts(items);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load shifts history'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts, activeShift]);

  const totalShiftsCount = shifts.length;
  const totalCashCollected = shifts.reduce((acc, s) => acc + (s.cashSalesTotal || 0), 0);
  const totalVariance = shifts.reduce((acc, s) => acc + (s.status === 'CLOSED' ? s.variance || 0 : 0), 0);
  const totalBills = shifts.reduce((acc, s) => acc + (s.billsCount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-md border border-zinc-200">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
            <Vault className="w-5 h-5 text-zinc-900" />
            Cash Drawer Shifts & Till Reconciliation
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Audit register opening floats, tender breakdowns, counted cash, and closing variances
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchShifts}
            disabled={isLoading}
            className="p-2 text-zinc-500 hover:text-zinc-900 rounded-md border border-zinc-200 hover:bg-zinc-50"
            title="Refresh"
          >
            <ArrowClockwise className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setOpenModal('drawer')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md ${
              isShiftOpen
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-zinc-900 hover:bg-zinc-800 text-white'
            }`}
          >
            <Vault className="w-4 h-4" />
            {isShiftOpen ? 'Manage / Close Active Shift' : 'Open New Shift'}
          </button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-md border border-red-200">{error}</div>}

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-md border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Active Register</span>
            {isShiftOpen ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                Shift Open
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-600">
                Closed
              </span>
            )}
          </div>
          <p className="text-xl font-bold text-zinc-900 mt-1">
            {isShiftOpen ? activeShift?.shiftNumber : 'None Open'}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            {isShiftOpen ? `Float: ${formatInr(activeShift?.openingFloat || 0)}` : 'Till is locked'}
          </p>
        </div>

        <div className="p-4 bg-white rounded-md border border-zinc-200 shadow-xs">
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Cash Collected</span>
          <p className="text-xl font-bold text-zinc-900 mt-1">{formatInr(totalCashCollected)}</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">Across {totalShiftsCount} shifts</p>
        </div>

        <div className="p-4 bg-white rounded-md border border-zinc-200 shadow-xs">
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Net Variance</span>
          <p
            className={`text-xl font-bold mt-1 ${
              totalVariance === 0 ? 'text-zinc-900' : totalVariance > 0 ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {totalVariance >= 0 ? `+${formatInr(totalVariance)}` : formatInr(totalVariance)}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            {totalVariance === 0 ? 'Balanced' : totalVariance > 0 ? 'Cash Surplus' : 'Cash Shortage'}
          </p>
        </div>

        <div className="p-4 bg-white rounded-md border border-zinc-200 shadow-xs">
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Bills Processed</span>
          <p className="text-xl font-bold text-zinc-900 mt-1">{totalBills}</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">Sales invoices rung up</p>
        </div>
      </div>

      {/* Shifts Table */}
      <div className="bg-white rounded-md border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-100 text-zinc-600 font-semibold uppercase tracking-wider border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3">Shift Number</th>
                <th className="px-4 py-3">Cashier</th>
                <th className="px-4 py-3">Opened</th>
                <th className="px-4 py-3">Closed</th>
                <th className="px-4 py-3 text-right">Float</th>
                <th className="px-4 py-3 text-right">Expected</th>
                <th className="px-4 py-3 text-right">Counted</th>
                <th className="px-4 py-3 text-right">Variance</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-700">
              {shifts.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-zinc-500">
                    No shifts logged yet.
                  </td>
                </tr>
              ) : (
                shifts.map((s) => (
                  <tr key={s._id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3 font-semibold text-zinc-900 font-mono">{s.shiftNumber}</td>
                    <td className="px-4 py-3 font-medium text-zinc-800">{s.cashierName}</td>
                    <td className="px-4 py-3 text-zinc-500">{formatDateTime(s.openedAt)}</td>
                    <td className="px-4 py-3 text-zinc-500">{s.closedAt ? formatDateTime(s.closedAt) : '—'}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatInr(s.openingFloat)}</td>
                    <td className="px-4 py-3 text-right font-mono font-medium">{formatInr(s.expectedCash)}</td>
                    <td className="px-4 py-3 text-right font-mono">
                      {s.status === 'CLOSED' ? formatInr(s.actualCashCounted) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold">
                      {s.status === 'CLOSED' ? (
                        <span
                          className={
                            s.variance === 0
                              ? 'text-zinc-600'
                              : s.variance > 0
                                ? 'text-emerald-600'
                                : 'text-red-600'
                          }
                        >
                          {s.variance >= 0 ? `+${formatInr(s.variance)}` : formatInr(s.variance)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          s.status === 'OPEN'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {s.status === 'OPEN' ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedShift(s)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs text-zinc-600 hover:text-zinc-900 border border-zinc-200 rounded-md hover:bg-zinc-50"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shift Detail Modal */}
      {selectedShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-md shadow-xl border border-zinc-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">Shift Audit: {selectedShift.shiftNumber}</h3>
                <p className="text-xs text-zinc-500">Cashier: {selectedShift.cashierName}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedShift(null)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-zinc-50 rounded-md">
                <div>
                  <span className="text-zinc-500">Opening Float:</span>
                  <p className="font-semibold text-zinc-900 mt-0.5">{formatInr(selectedShift.openingFloat)}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Expected Cash:</span>
                  <p className="font-semibold text-zinc-900 mt-0.5">{formatInr(selectedShift.expectedCash)}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Actual Counted:</span>
                  <p className="font-semibold text-zinc-900 mt-0.5">{formatInr(selectedShift.actualCashCounted)}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Shift Variance:</span>
                  <p
                    className={`font-bold mt-0.5 ${
                      selectedShift.variance === 0
                        ? 'text-zinc-900'
                        : selectedShift.variance > 0
                          ? 'text-emerald-600'
                          : 'text-red-600'
                    }`}
                  >
                    {selectedShift.variance >= 0
                      ? `+${formatInr(selectedShift.variance)}`
                      : formatInr(selectedShift.variance)}
                  </p>
                </div>
              </div>

              <div className="border-t border-zinc-200 pt-3 space-y-1.5">
                <p className="font-semibold text-zinc-800 uppercase tracking-wider text-[11px]">Tender Summary</p>
                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="text-zinc-600">Cash Sales:</span>
                  <span className="font-mono font-medium">{formatInr(selectedShift.cashSalesTotal)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="text-zinc-600">UPI Payments:</span>
                  <span className="font-mono font-medium">{formatInr(selectedShift.upiSalesTotal)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="text-zinc-600">Card Payments:</span>
                  <span className="font-mono font-medium">{formatInr(selectedShift.cardSalesTotal)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="text-zinc-600">Credit (Khata) Sales:</span>
                  <span className="font-mono font-medium">{formatInr(selectedShift.creditSalesTotal)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100 text-red-600">
                  <span>Cash Refunds:</span>
                  <span className="font-mono font-medium">-{formatInr(selectedShift.refundsTotal)}</span>
                </div>
                <div className="flex justify-between py-1 font-semibold text-zinc-900">
                  <span>Bills Count:</span>
                  <span>{selectedShift.billsCount} bills</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedShift(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

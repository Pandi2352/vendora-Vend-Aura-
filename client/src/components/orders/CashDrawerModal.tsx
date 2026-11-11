import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Vault, Clock, Warning, ArrowsClockwise } from '@phosphor-icons/react';
import type { ShiftSummary } from '../../types/shift-return.types';

const API_BASE = 'http://localhost:5000/api/v1';

interface CashDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  cashierName: string;
  onShiftChange?: (shift: ShiftSummary | null) => void;
}

export function CashDrawerModal({
  isOpen,
  onClose,
  tenantId,
  cashierName,
  onShiftChange,
}: CashDrawerModalProps) {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [activeShift, setActiveShift] = useState<ShiftSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [historyList, setHistoryList] = useState<ShiftSummary[]>([]);

  // Open Shift Form State
  const [openingFloat, setOpeningFloat] = useState<number>(2000);
  const [openNotes, setOpenNotes] = useState('');
  const [isOpening, setIsOpening] = useState(false);

  // Close Shift Form State
  const [actualCash, setActualCash] = useState<string>('');
  const [closeNotes, setCloseNotes] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  const fetchCurrentShift = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/orders/shifts/current?tenantId=${tenantId}`);
      const shift = res.data?.data || null;
      setActiveShift(shift);
      if (onShiftChange) onShiftChange(shift);
    } catch {
      // silently handle
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/orders/shifts/history?tenantId=${tenantId}`);
      setHistoryList(res.data?.data || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCurrentShift();
      if (activeTab === 'history') fetchHistory();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleOpenShift = async () => {
    setIsOpening(true);
    try {
      const payload = { tenantId, cashierName, openingFloat: Number(openingFloat) || 0, notes: openNotes };
      const res = await axios.post(`${API_BASE}/orders/shifts/open`, payload);
      const shift = res.data?.data?.shift || res.data?.shift;
      setActiveShift(shift);
      if (onShiftChange) onShiftChange(shift);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to open shift.');
    } finally {
      setIsOpening(false);
    }
  };

  const handleCloseShift = async () => {
    if (!activeShift?._id) return;
    setIsClosing(true);
    try {
      const counted = parseFloat(actualCash) || 0;
      const payload = { tenantId, shiftId: activeShift._id, actualCashCounted: counted, notes: closeNotes };
      await axios.post(`${API_BASE}/orders/shifts/close`, payload);
      setActiveShift(null);
      setActualCash('');
      setCloseNotes('');
      if (onShiftChange) onShiftChange(null);
      fetchHistory();
      setActiveTab('history');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to close shift.');
    } finally {
      setIsClosing(false);
    }
  };

  const countedVal = parseFloat(actualCash);
  const variance = !isNaN(countedVal) && activeShift ? countedVal - activeShift.expectedCash : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-md max-w-xl w-full flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Vault weight="bold" className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="font-bold text-sm text-zinc-950">Cash Drawer & Shift Management</h3>
              <p className="text-[11px] text-zinc-500">Track till cash, register movements and end-of-shift reconciliation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-200 bg-zinc-50 px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('current')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'current' ? 'border-red-600 text-red-600' : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Current Shift
          </button>
          <button
            onClick={() => { setActiveTab('history'); fetchHistory(); }}
            className={`pb-2 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'history' ? 'border-red-600 text-red-600' : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Shift History
          </button>
          <div className="ml-auto pb-2">
            <button onClick={fetchCurrentShift} className="text-zinc-400 hover:text-zinc-700 p-1 rounded cursor-pointer" title="Refresh">
              <ArrowsClockwise className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'current' ? (
            !activeShift ? (
              /* No Active Shift -> Prompt Open */
              <div className="space-y-4 py-2">
                <div className="p-3.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                  <Warning weight="bold" className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">No Cash Drawer Shift is currently open.</span>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Open a new shift to record beginning physical float cash in the till and start taking orders.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Opening Physical Cash Float (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={openingFloat}
                      onChange={(e) => setOpeningFloat(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm font-mono font-bold rounded-md border border-zinc-300 focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Opening Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Morning opening shift, clean till"
                      value={openNotes}
                      onChange={(e) => setOpenNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 focus:border-red-600"
                    />
                  </div>

                  <button
                    onClick={handleOpenShift}
                    disabled={isOpening}
                    className="w-full py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer transition-colors"
                  >
                    {isOpening ? 'Opening Shift...' : `Open Shift with ₹${openingFloat} Float`}
                  </button>
                </div>
              </div>
            ) : (
              /* Shift is Open -> Display Live Stats & Reconcile */
              <div className="space-y-4">
                <div className="p-3 rounded-md bg-zinc-900 text-white flex justify-between items-center text-xs">
                  <div>
                    <span className="font-mono font-bold text-red-500">{activeShift.shiftNumber}</span>
                    <span className="text-zinc-400 ml-2">Cashier: {activeShift.cashierName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-300 font-mono">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{new Date(activeShift.openedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-md border border-zinc-200 bg-zinc-50">
                    <span className="text-[10px] text-zinc-500 block">Opening Float</span>
                    <span className="font-mono font-bold text-sm text-zinc-900">₹{activeShift.openingFloat}</span>
                  </div>
                  <div className="p-2.5 rounded-md border border-zinc-200 bg-emerald-50/50">
                    <span className="text-[10px] text-zinc-500 block">Cash Sales</span>
                    <span className="font-mono font-bold text-sm text-emerald-700">₹{activeShift.cashSalesTotal}</span>
                  </div>
                  <div className="p-2.5 rounded-md border border-zinc-200 bg-zinc-50">
                    <span className="text-[10px] text-zinc-500 block">UPI Sales</span>
                    <span className="font-mono font-bold text-sm text-zinc-900">₹{activeShift.upiSalesTotal}</span>
                  </div>
                  <div className="p-2.5 rounded-md border border-zinc-200 bg-red-50/50">
                    <span className="text-[10px] text-zinc-500 block">Cash Refunds</span>
                    <span className="font-mono font-bold text-sm text-red-700">-₹{activeShift.cashRefundsTotal || 0}</span>
                  </div>
                </div>

                {/* Expected Cash in Till Formula Card */}
                <div className="p-3 rounded-md bg-zinc-100 border border-zinc-200 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-zinc-800">Expected Physical Cash in Drawer:</span>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      Float (₹{activeShift.openingFloat}) + Cash Sales (₹{activeShift.cashSalesTotal}) - Refunds (₹{activeShift.cashRefundsTotal || 0})
                    </p>
                  </div>
                  <span className="font-mono font-black text-base text-zinc-950">₹{activeShift.expectedCash}</span>
                </div>

                {/* Closing Reconcile Section */}
                <div className="pt-2 border-t border-zinc-200 space-y-3">
                  <h4 className="font-bold text-xs text-zinc-900">End-of-Shift Reconciliation</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                        Actual Physical Cash Counted (₹)
                      </label>
                      <input
                        type="number"
                        placeholder={`e.g. ${activeShift.expectedCash}`}
                        value={actualCash}
                        onChange={(e) => setActualCash(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-md border border-zinc-300 focus:border-red-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 mb-1">Closing Variance</label>
                      <div className={`px-3 py-1.5 rounded-md font-mono font-bold text-xs border ${
                        !actualCash ? 'bg-zinc-50 text-zinc-400 border-zinc-200' :
                        variance === 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                        variance > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                        'bg-red-50 text-red-700 border-red-300'
                      }`}>
                        {!actualCash ? 'Enter counted cash' :
                         variance === 0 ? '₹0 (Balanced)' :
                         variance > 0 ? `+₹${variance} (Overage)` :
                         `-₹${Math.abs(variance)} (Shortage)`}
                      </div>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Closing reconciliation notes..."
                    value={closeNotes}
                    onChange={(e) => setCloseNotes(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-zinc-300"
                  />

                  <button
                    onClick={handleCloseShift}
                    disabled={isClosing || !actualCash}
                    className="w-full py-2.5 rounded-md bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs cursor-pointer transition-colors"
                  >
                    {isClosing ? 'Closing Shift...' : 'Reconcile & Close Cash Drawer Shift'}
                  </button>
                </div>
              </div>
            )
          ) : (
            /* Shift History */
            <div className="space-y-2">
              {historyList.length === 0 ? (
                <div className="py-8 text-center text-zinc-400 text-xs">No past shifts recorded yet.</div>
              ) : (
                historyList.map((sh) => (
                  <div key={sh.shiftNumber} className="p-3 rounded-md border border-zinc-200 bg-zinc-50 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-mono font-bold text-zinc-900">{sh.shiftNumber}</span>
                      <span className="text-zinc-500 ml-2">by {sh.cashierName}</span>
                      <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        {new Date(sh.openedAt).toLocaleDateString('en-IN')} • Float ₹{sh.openingFloat} • Sales ₹{sh.cashSalesTotal}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-xs block">Counted: ₹{sh.actualCashCounted}</span>
                      <span className={`text-[10px] font-mono font-bold ${
                        (sh.variance || 0) === 0 ? 'text-emerald-600' : (sh.variance || 0) > 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {(sh.variance || 0) === 0 ? 'Balanced' : (sh.variance || 0) > 0 ? `+₹${sh.variance}` : `-₹${Math.abs(sh.variance || 0)}`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

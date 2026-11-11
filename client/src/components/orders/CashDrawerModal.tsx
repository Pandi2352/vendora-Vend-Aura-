import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Vault, ArrowsClockwise } from '@phosphor-icons/react';
import type { ShiftSummary } from '../../types/shift-return.types';
import { ShiftHistoryTab } from './shift/ShiftHistoryTab';
import { ActiveShiftContent } from './shift/ActiveShiftContent';

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

  // Shift Forms State
  const [openingFloat, setOpeningFloat] = useState<number>(2000);
  const [openNotes, setOpenNotes] = useState('');
  const [isOpening, setIsOpening] = useState(false);
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
      // ignore
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
            <ActiveShiftContent
              activeShift={activeShift}
              openingFloat={openingFloat}
              setOpeningFloat={setOpeningFloat}
              openNotes={openNotes}
              setOpenNotes={setOpenNotes}
              isOpening={isOpening}
              onOpenShift={handleOpenShift}
              actualCash={actualCash}
              setActualCash={setActualCash}
              closeNotes={closeNotes}
              setCloseNotes={setCloseNotes}
              isClosing={isClosing}
              onCloseShift={handleCloseShift}
            />
          ) : (
            <ShiftHistoryTab historyList={historyList} />
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

import { usePreferences } from '../../hooks/usePreferences';
import { useState, useEffect, useCallback } from 'react';
import { X, Vault, ArrowsClockwise, WarningCircle } from '@phosphor-icons/react';
import { api, unwrap, getErrorMessage } from '../../lib/api';
import type { ShiftSummary } from '../../types/shift-return.types';
import { ShiftHistoryTab } from './shift/ShiftHistoryTab';
import { ActiveShiftContent } from './shift/ActiveShiftContent';

interface CashDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShiftChange?: (shift: ShiftSummary | null) => void;
}

export function CashDrawerModal({ isOpen, onClose, onShiftChange }: CashDrawerModalProps) {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [activeShift, setActiveShift] = useState<ShiftSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [historyList, setHistoryList] = useState<ShiftSummary[]>([]);
  const [loadError, setLoadError] = useState('');

  // Shift Forms State
  const { defaultOpeningFloat } = usePreferences();
  const [openingFloat, setOpeningFloat] = useState<number>(defaultOpeningFloat);
  const [openNotes, setOpenNotes] = useState('');
  const [isOpening, setIsOpening] = useState(false);
  const [actualCash, setActualCash] = useState<string>('');
  const [closeNotes, setCloseNotes] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  const fetchCurrentShift = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const shift = unwrap<ShiftSummary | null>(await api.get('/orders/shifts/current')) || null;
      setActiveShift(shift);
      onShiftChange?.(shift);
    } catch (err) {
      setLoadError(getErrorMessage(err, 'Failed to load current shift.'));
    } finally {
      setIsLoading(false);
    }
  }, [onShiftChange]);

  const fetchHistory = useCallback(async () => {
    try {
      const list = unwrap<ShiftSummary[]>(await api.get('/orders/shifts/history', { params: { limit: 30 } }));
      setHistoryList(Array.isArray(list) ? list : []);
    } catch (err) {
      setLoadError(getErrorMessage(err, 'Failed to load shift history.'));
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    fetchCurrentShift();
    if (activeTab === 'history') fetchHistory();
  }, [isOpen, activeTab, fetchCurrentShift, fetchHistory]);

  if (!isOpen) return null;

  const handleOpenShift = async () => {
    setIsOpening(true);
    try {
      const res = await api.post('/orders/shifts/open', {
        openingFloat: Number(openingFloat) || 0,
        notes: openNotes || undefined,
      });
      const shift = unwrap<ShiftSummary>(res);
      setActiveShift(shift);
      onShiftChange?.(shift);
      setOpenNotes('');
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to open shift.'));
    } finally {
      setIsOpening(false);
    }
  };

  const handleCloseShift = async () => {
    const shiftId = activeShift?._id ?? activeShift?.id;
    if (!shiftId) return;
    setIsClosing(true);
    try {
      await api.post('/orders/shifts/close', {
        shiftId,
        actualCashCounted: parseFloat(actualCash) || 0,
        notes: closeNotes || undefined,
      });
      setActiveShift(null);
      setActualCash('');
      setCloseNotes('');
      onShiftChange?.(null);
      setActiveTab('history');
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to close shift.'));
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-md max-w-xl w-full flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Vault weight="bold" className="w-5 h-5 text-primary-600" />
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
              activeTab === 'current' ? 'border-primary-600 text-red-600' : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Current Shift
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'history' ? 'border-primary-600 text-red-600' : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Shift History
          </button>
          <div className="ml-auto pb-2">
            <button onClick={fetchCurrentShift} className="text-zinc-400 hover:text-zinc-700 p-1 rounded-md cursor-pointer" title="Refresh">
              <ArrowsClockwise className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {loadError && (
            <div className="p-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <WarningCircle weight="bold" className="w-4 h-4 shrink-0" />
              <span>{loadError}</span>
            </div>
          )}
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

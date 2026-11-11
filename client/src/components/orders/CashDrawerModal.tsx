import { useCallback, useEffect, useState } from 'react';
import { ArrowsClockwise } from '@phosphor-icons/react';
import { usePreferences } from '@/hooks/usePreferences';
import { useToast } from '@/hooks/useToast';
import { api, unwrap, getErrorMessage } from '@/lib/api';
import { Alert, Button, Dialog, Spinner, Tabs, cn } from '@/components/ui';
import type { ShiftSummary } from '@/types/shift-return.types';
import type { CloseShiftValues, OpenShiftValues } from '@/validations/orders';
import { formatInr } from '@/utils';
import { ShiftHistoryTab } from './shift/ShiftHistoryTab';
import { ActiveShiftContent } from './shift/ActiveShiftContent';

interface CashDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShiftChange?: (shift: ShiftSummary | null) => void;
}

type DrawerTab = 'current' | 'history';

const TABS = [
  { value: 'current' as const, label: 'Current shift' },
  { value: 'history' as const, label: 'Shift history' },
];

export function CashDrawerModal({ isOpen, onClose, onShiftChange }: CashDrawerModalProps) {
  const toast = useToast();
  const { defaultOpeningFloat } = usePreferences();
  const [activeTab, setActiveTab] = useState<DrawerTab>('current');
  const [activeShift, setActiveShift] = useState<ShiftSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [historyList, setHistoryList] = useState<ShiftSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

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
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const list = unwrap<ShiftSummary[]>(await api.get('/orders/shifts/history', { params: { limit: 30 } }));
      setHistoryList(Array.isArray(list) ? list : []);
    } catch (err) {
      setHistoryError(getErrorMessage(err, 'Failed to load shift history.'));
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    fetchCurrentShift();
    if (activeTab === 'history') fetchHistory();
  }, [isOpen, activeTab, fetchCurrentShift, fetchHistory]);

  const handleOpenShift = async (values: OpenShiftValues) => {
    const shift = unwrap<ShiftSummary>(await api.post('/orders/shifts/open', values));
    setActiveShift(shift);
    onShiftChange?.(shift);
    toast.success('Shift opened', `${shift.shiftNumber} with ${formatInr(shift.openingFloat)} float`);
  };

  const handleCloseShift = async (values: CloseShiftValues) => {
    const shiftId = activeShift?._id ?? activeShift?.id;
    if (!shiftId) return;
    await api.post('/orders/shifts/close', { shiftId, ...values });
    toast.success('Shift closed', activeShift?.shiftNumber);
    setActiveShift(null);
    onShiftChange?.(null);
    setActiveTab('history');
  };

  const refresh = () => {
    fetchCurrentShift();
    if (activeTab === 'history') fetchHistory();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      size="lg"
      title="Cash drawer & shift"
      description="Track till cash and reconcile at the end of the shift"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        <Tabs items={TABS} value={activeTab} onChange={setActiveTab} />
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          aria-label="Refresh"
          icon={<ArrowsClockwise className={cn('w-4 h-4', isLoading && 'animate-spin')} />}
        />
      </div>

      {loadError && (
        <Alert tone="error" className="mb-4">
          {loadError}
        </Alert>
      )}

      {activeTab === 'history' ? (
        <ShiftHistoryTab historyList={historyList} loading={historyLoading} error={historyError} onRetry={fetchHistory} />
      ) : isLoading && !activeShift ? (
        <div className="py-10 flex justify-center">
          <Spinner size="lg" label="Loading shift" className="text-primary-600" />
        </div>
      ) : (
        <ActiveShiftContent
          // Remount the forms when the shift changes, so they start clean.
          key={activeShift?.shiftNumber ?? 'none'}
          activeShift={activeShift}
          defaultOpeningFloat={defaultOpeningFloat}
          onOpenShift={handleOpenShift}
          onCloseShift={handleCloseShift}
        />
      )}
    </Dialog>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui';
import { round2 } from '@/lib/totals';
import { formatInr } from '@/utils';
import {
  X,
  Money,
  DeviceMobile,
  CreditCard,
  CheckCircle,
  HandCoins,
  WarningCircle,
} from '@phosphor-icons/react';
import type { CustomerItem, PaymentMode } from '../types/pos.types';
import { CustomerTagSelector } from './checkout/CustomerTagSelector';
import { PaymentModePanels } from './checkout/PaymentModePanels';

const PAYMENT_TABS: Array<{ id: PaymentMode; label: string; hotkey?: string; icon: typeof Money }> = [
  { id: 'CASH', label: 'Cash', hotkey: 'F8', icon: Money },
  { id: 'UPI', label: 'UPI / QR', hotkey: 'F9', icon: DeviceMobile },
  { id: 'CARD', label: 'Card Swipe', hotkey: 'F10', icon: CreditCard },
  { id: 'CREDIT', label: 'Khata / Credit', icon: HandCoins },
];

/** Mounted only while open, so tender state starts fresh (cash tendered = grand total) every time. */
interface CheckoutModalProps {
  grandTotal: number;
  customers: CustomerItem[];
  selectedCustomer: CustomerItem | null;
  onSelectCustomer: (c: CustomerItem | null) => void;
  onClose: () => void;
  onFinalize: (paymentMode: PaymentMode, cashTendered: number, customer?: CustomerItem | null) => void;
  error?: string;
  isSubmitting?: boolean;
}

export function CheckoutModal({
  grandTotal,
  customers,
  selectedCustomer,
  onSelectCustomer,
  onClose,
  onFinalize,
  error,
  isSubmitting = false,
}: CheckoutModalProps) {
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [cashTendered, setCashTendered] = useState<number>(grandTotal);
  const [cashTouched, setCashTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const cashInputRef = useRef<HTMLInputElement>(null);

  const isCreditExceeded =
    paymentMode === 'CREDIT' &&
    !!selectedCustomer &&
    selectedCustomer.currentCreditBalance + grandTotal > selectedCustomer.creditLimit;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F8') {
        e.preventDefault();
        setPaymentMode('CASH');
      } else if (e.key === 'F9') {
        e.preventDefault();
        setPaymentMode('UPI');
      } else if (e.key === 'F10') {
        e.preventDefault();
        setPaymentMode('CARD');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const cashInvalid = paymentMode === 'CASH' && round2(cashTendered) < round2(grandTotal);
  const cashError =
    cashInvalid && (cashTouched || submitAttempted) ? `Cash tendered must be at least ${formatInr(grandTotal)}` : undefined;

  const canSubmit = !isSubmitting && !(paymentMode === 'CREDIT' && (!selectedCustomer || isCreditExceeded));

  const handleComplete = () => {
    if (cashInvalid) {
      setSubmitAttempted(true);
      cashInputRef.current?.focus();
      return;
    }
    onFinalize(paymentMode, paymentMode === 'CASH' ? cashTendered : grandTotal, selectedCustomer);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-sans">
      <div className="bg-white rounded-md border border-zinc-300 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-sm text-zinc-950">Payment Tender & Checkout</h3>
            <p className="text-[0.6875rem] text-zinc-500">Tag customer & select settlement tender</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-zinc-200 hover:bg-zinc-300 text-zinc-700 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Customer Tagging Selector */}
          <CustomerTagSelector
            customers={customers}
            selectedCustomer={selectedCustomer}
            onSelectCustomer={onSelectCustomer}
          />

          {/* Amount Due Banner */}
          <div className="p-3.5 rounded-md bg-ink text-white text-center">
            <span className="text-[0.6875rem] text-zinc-400 uppercase tracking-wider block">Total Amount Due</span>
            <span className="font-mono font-black text-2xl text-white mt-0.5 block">
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Payment Mode Selector Tabs */}
          <div className="grid grid-cols-4 gap-2">
            {PAYMENT_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = paymentMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setPaymentMode(tab.id)}
                  className={`p-2.5 rounded-md border flex flex-col items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <Icon weight="bold" className="w-4 h-4" />
                  <span className="text-[0.6875rem]">{tab.label}</span>
                  {tab.hotkey && (
                    <span className="text-[0.5625rem] font-mono opacity-60 px-1 rounded bg-black/5 dark:bg-white/10">
                      {tab.hotkey}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Tender Panel */}
          <PaymentModePanels
            paymentMode={paymentMode}
            grandTotal={grandTotal}
            cashTendered={cashTendered}
            selectedCustomer={selectedCustomer}
            onCashTenderedChange={setCashTendered}
            onAddCash={(amount) => setCashTendered((prev) => prev + amount)}
            onSetExact={() => setCashTendered(grandTotal)}
            cashError={cashError}
            onCashBlur={() => setCashTouched(true)}
            cashInputRef={cashInputRef}
          />

          {error && (
            <div className="p-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <WarningCircle weight="bold" className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end gap-2 shrink-0">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleComplete}
            disabled={!canSubmit}
            loading={isSubmitting}
            icon={<CheckCircle weight="bold" className="w-4 h-4" />}
          >
            {isSubmitting ? 'Saving bill…' : 'Complete & print bill'}
          </Button>
        </div>
      </div>
    </div>
  );
}

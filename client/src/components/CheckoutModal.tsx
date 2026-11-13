import { useEffect, useRef, useState } from 'react';
import { Button } from './ui';
import { round2 } from '../lib/totals';
import { formatInr } from '../utils';
import { api, unwrap, getErrorMessage } from '../lib/api';
import {
  X,
  Money,
  DeviceMobile,
  CreditCard,
  CheckCircle,
  HandCoins,
  WarningCircle,
  Tag,
  Truck,
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

interface AppliedDiscount {
  code: string;
  name: string;
  discountAmount: number;
  description: string;
}

/** Mounted only while open, so tender state starts fresh every time. */
interface CheckoutModalProps {
  grandTotal: number;
  customers: CustomerItem[];
  selectedCustomer: CustomerItem | null;
  onSelectCustomer: (c: CustomerItem | null) => void;
  onClose: () => void;
  onFinalize: (
    paymentMode: PaymentMode,
    cashTendered: number,
    customer?: CustomerItem | null,
    discount?: { couponCode: string; discountAmount: number } | null,
    delivery?: {
      isHomeDelivery: boolean;
      deliveryAddress?: string;
      deliveryRiderName?: string;
      deliveryRiderPhone?: string;
    } | null,
  ) => void;
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
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedDiscount | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [isHomeDelivery, setIsHomeDelivery] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryRider, setDeliveryRider] = useState('');

  const effectiveGrandTotal = appliedCoupon
    ? Math.max(0, round2(grandTotal - appliedCoupon.discountAmount))
    : grandTotal;

  const [cashTendered, setCashTendered] = useState<number>(effectiveGrandTotal);
  const [cashTouched, setCashTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const cashInputRef = useRef<HTMLInputElement>(null);

  const isCreditExceeded =
    paymentMode === 'CREDIT' &&
    !!selectedCustomer &&
    selectedCustomer.currentCreditBalance + effectiveGrandTotal > selectedCustomer.creditLimit;

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

  const handleApplyCoupon = async () => {
    const trimmed = couponCode.trim().toUpperCase();
    if (!trimmed) return;
    setIsValidatingCoupon(true);
    setCouponError('');
    try {
      const res = await api.post('/discounts/validate', {
        code: trimmed,
        orderAmount: grandTotal,
      });
      const data = unwrap<AppliedDiscount>(res);
      setAppliedCoupon(data);
      const newPayable = Math.max(0, round2(grandTotal - data.discountAmount));
      setCashTendered(newPayable);
    } catch (err) {
      setCouponError(getErrorMessage(err, 'Invalid coupon code or not applicable to this order'));
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    setCashTendered(grandTotal);
  };

  const cashInvalid = paymentMode === 'CASH' && round2(cashTendered) < round2(effectiveGrandTotal);
  const cashError =
    cashInvalid && (cashTouched || submitAttempted)
      ? `Cash tendered must be at least ${formatInr(effectiveGrandTotal)}`
      : undefined;

  const canSubmit = !isSubmitting && !(paymentMode === 'CREDIT' && (!selectedCustomer || isCreditExceeded));

  const handleComplete = () => {
    if (cashInvalid) {
      setSubmitAttempted(true);
      cashInputRef.current?.focus();
      return;
    }
    const finalTender = paymentMode === 'CASH' ? cashTendered : effectiveGrandTotal;
    const discountPayload = appliedCoupon
      ? {
          couponCode: appliedCoupon.code,
          discountAmount: appliedCoupon.discountAmount,
        }
      : null;
    const deliveryPayload = isHomeDelivery
      ? {
          isHomeDelivery: true,
          deliveryAddress: deliveryAddress.trim() || undefined,
          deliveryRiderName: deliveryRider.trim() || undefined,
        }
      : null;
    onFinalize(paymentMode, finalTender, selectedCustomer, discountPayload, deliveryPayload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-sans">
      <div className="bg-white rounded-md border border-zinc-300 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-sm text-zinc-950">Payment Tender & Checkout</h3>
            <p className="text-[0.6875rem] text-zinc-500">Tag customer, apply promo coupon & select settlement tender</p>
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
          <div className="p-3.5 rounded-md bg-primary-50 border border-primary-200 text-center">
            {appliedCoupon ? (
              <div className="space-y-1 mb-2 pb-2 border-b border-primary-200 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Bill Subtotal:</span>
                  <span className="font-mono">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Promo Offer ({appliedCoupon.code}):</span>
                  <span className="font-mono">-₹{appliedCoupon.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ) : null}
            <span className="text-[0.6875rem] text-primary-700 font-bold uppercase tracking-wider block">
              {appliedCoupon ? 'Net Payable Amount' : 'Total Amount Due'}
            </span>
            <span className="font-mono font-black text-2xl text-zinc-900 mt-0.5 block">
              ₹{effectiveGrandTotal.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Coupon Code / Discount Validation Field */}
          <div className="p-3 rounded-md border border-dashed border-zinc-300 bg-zinc-50/70 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
              <span className="flex items-center gap-1.5">
                <Tag weight="bold" className="w-3.5 h-3.5 text-primary-600" />
                Merchandising & Promo Coupon
              </span>
              {appliedCoupon && (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-[0.6875rem] text-red-600 hover:text-red-700 font-bold cursor-pointer"
                >
                  Remove Coupon
                </button>
              )}
            </div>
            {!appliedCoupon ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. DIWALI20, FLAT50"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyCoupon();
                    }
                  }}
                  className="flex-1 px-2.5 py-1.5 text-xs font-mono font-bold uppercase rounded-md border border-zinc-300 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={!couponCode.trim() || isValidatingCoupon}
                  loading={isValidatingCoupon}
                  onClick={handleApplyCoupon}
                >
                  Apply
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 rounded bg-emerald-50 border border-emerald-200 text-xs">
                <div>
                  <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle weight="fill" className="w-4 h-4 text-emerald-600" />
                    <span>{appliedCoupon.code}</span>
                    <span className="font-normal text-emerald-600">({appliedCoupon.name})</span>
                  </div>
                  <div className="text-[0.6875rem] text-emerald-700 mt-0.5">{appliedCoupon.description}</div>
                </div>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  -₹{appliedCoupon.discountAmount}
                </span>
              </div>
            )}
            {couponError && (
              <p className="text-[0.6875rem] text-red-600 flex items-center gap-1">
                <WarningCircle weight="bold" className="w-3.5 h-3.5 shrink-0" />
                {couponError}
              </p>
            )}
          </div>

          {/* Home Delivery Fulfillment Section */}
          <div className="p-3 rounded-md border border-zinc-200 bg-zinc-50/70 space-y-2">
            <label htmlFor="checkout-home-delivery-toggle" className="flex items-center gap-2 cursor-pointer select-none">
              <input
                id="checkout-home-delivery-toggle"
                type="checkbox"
                checked={isHomeDelivery}
                onChange={(e) => setIsHomeDelivery(e.target.checked)}
                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-zinc-300"
              />
              <span className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
                <Truck weight="bold" className="w-3.5 h-3.5 text-primary-600" />
                Dispatch as Home Delivery Order
              </span>
            </label>
            {isHomeDelivery && (
              <div className="space-y-2 pt-1 border-t border-zinc-200/60">
                <div>
                  <label htmlFor="checkout-delivery-address" className="block text-[11px] font-semibold text-zinc-600 mb-0.5">
                    Delivery Address
                  </label>
                  <input
                    id="checkout-delivery-address"
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Door no, street, landmark, PIN"
                    className="w-full h-8 px-2.5 rounded border border-zinc-300 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="checkout-rider-name" className="block text-[11px] font-semibold text-zinc-600 mb-0.5">
                    Assigned Rider (Optional)
                  </label>
                  <input
                    id="checkout-rider-name"
                    type="text"
                    value={deliveryRider}
                    onChange={(e) => setDeliveryRider(e.target.value)}
                    placeholder="Rider name (e.g. Ramesh)"
                    className="w-full h-8 px-2.5 rounded border border-zinc-300 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
            )}
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
            grandTotal={effectiveGrandTotal}
            cashTendered={cashTendered}
            selectedCustomer={selectedCustomer}
            onCashTenderedChange={setCashTendered}
            onAddCash={(amount) => setCashTendered((prev) => prev + amount)}
            onSetExact={() => setCashTendered(effectiveGrandTotal)}
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

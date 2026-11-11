import { useState } from 'react';
import {
  X,
  Money,
  DeviceMobile,
  CreditCard,
  CheckCircle,
  QrCode,
  HandCoins,
  User,
  WarningCircle,
} from '@phosphor-icons/react';
import type { CustomerItem } from '../types/pos.types';

interface CheckoutModalProps {
  grandTotal: number;
  isOpen: boolean;
  customers: CustomerItem[];
  selectedCustomer: CustomerItem | null;
  onSelectCustomer: (c: CustomerItem | null) => void;
  onClose: () => void;
  onFinalize: (
    paymentMode: 'CASH' | 'UPI' | 'CARD' | 'CREDIT',
    cashTendered: number,
    customer?: CustomerItem | null
  ) => void;
}

export function CheckoutModal({
  grandTotal,
  isOpen,
  customers,
  selectedCustomer,
  onSelectCustomer,
  onClose,
  onFinalize,
}: CheckoutModalProps) {
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI' | 'CARD' | 'CREDIT'>('CASH');
  const [cashTendered, setCashTendered] = useState<number>(grandTotal);
  const [customerSearch, setCustomerSearch] = useState('');

  if (!isOpen) return null;

  const changeDue = Math.max(0, cashTendered - grandTotal);

  const addCash = (amount: number) => {
    setCashTendered((prev) => prev + amount);
  };

  const setExact = () => {
    setCashTendered(grandTotal);
  };

  const filteredCustomerList = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch)
  );

  const availableCredit = selectedCustomer
    ? Math.max(0, selectedCustomer.creditLimit - selectedCustomer.currentCreditBalance)
    : 0;
  const isCreditExceeded = selectedCustomer
    ? selectedCustomer.currentCreditBalance + grandTotal > selectedCustomer.creditLimit
    : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/75 backdrop-blur-xs">
      <div className="bg-white rounded-md border border-zinc-300 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-sm text-zinc-950">Payment Tender & Checkout</h3>
            <p className="text-[11px] text-zinc-500">Tag customer & select settlement tender</p>
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
          <div className="p-3 bg-zinc-50 rounded-md border border-zinc-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-zinc-500" />
                <span>Customer Profile (Optional for Cash, Required for Khata)</span>
              </span>
              {selectedCustomer && (
                <button
                  type="button"
                  onClick={() => onSelectCustomer(null)}
                  className="text-red-600 hover:text-red-700 font-semibold text-[11px] cursor-pointer"
                >
                  Detach
                </button>
              )}
            </div>

            {selectedCustomer ? (
              <div className="flex items-center justify-between bg-white p-2.5 rounded-md border border-zinc-200 font-mono">
                <div>
                  <span className="font-bold font-sans text-zinc-950 text-xs block">{selectedCustomer.name}</span>
                  <span className="text-zinc-500 text-[11px]">Mob: {selectedCustomer.phone}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 block uppercase">Khata Balance</span>
                  <span
                    className={`font-bold text-xs ${
                      selectedCustomer.currentCreditBalance > 0 ? 'text-red-600' : 'text-emerald-600'
                    }`}
                  >
                    ₹{selectedCustomer.currentCreditBalance.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Type customer name or mobile number (e.g. 9840...)"
                  className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-red-600 outline-none text-xs bg-white"
                />

                {customerSearch.trim() && (
                  <div className="max-h-28 overflow-y-auto border border-zinc-200 rounded-md bg-white divide-y divide-zinc-100">
                    {filteredCustomerList.slice(0, 4).map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onSelectCustomer(c);
                          setCustomerSearch('');
                        }}
                        className="p-2 hover:bg-red-50 cursor-pointer flex justify-between items-center text-xs"
                      >
                        <div>
                          <span className="font-bold text-zinc-900">{c.name}</span>
                          <span className="text-zinc-400 font-mono text-[11px] ml-2">{c.phone}</span>
                        </div>
                        <span className="font-mono text-zinc-500 text-[11px]">
                          Khata: ₹{c.currentCreditBalance}
                        </span>
                      </div>
                    ))}
                    {filteredCustomerList.length === 0 && (
                      <div className="p-2 text-center text-zinc-400 text-xs">
                        No matching customer. They can be registered under Customers tab.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Amount Due Banner */}
          <div className="p-3.5 rounded-md bg-zinc-950 text-white text-center">
            <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">
              Total Amount Due
            </span>
            <span className="font-mono font-black text-2xl text-red-500 mt-0.5 block">
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Payment Mode Selector Tabs (4 Tabs) */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'CASH', label: 'Cash', icon: Money },
              { id: 'UPI', label: 'UPI / QR', icon: DeviceMobile },
              { id: 'CARD', label: 'Card Swipe', icon: CreditCard },
              { id: 'CREDIT', label: 'Khata / Credit', icon: HandCoins },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = paymentMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setPaymentMode(tab.id as any)}
                  className={`p-2.5 rounded-md border flex flex-col items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'border-red-600 bg-red-50 text-red-700'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <Icon weight="bold" className="w-4 h-4" />
                  <span className="text-[11px]">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* CASH MODE CONTROLS */}
          {paymentMode === 'CASH' && (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Cash Tendered (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={cashTendered || ''}
                  onChange={(e) => setCashTendered(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-md border border-zinc-300 font-mono font-bold text-base text-zinc-950 focus:border-red-600 outline-none"
                />
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={setExact}
                  className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold border border-zinc-200 cursor-pointer"
                >
                  Exact (₹{grandTotal})
                </button>
                <button
                  type="button"
                  onClick={() => addCash(100)}
                  className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold border border-zinc-200 cursor-pointer"
                >
                  +₹100
                </button>
                <button
                  type="button"
                  onClick={() => addCash(500)}
                  className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold border border-zinc-200 cursor-pointer"
                >
                  +₹500
                </button>
                <button
                  type="button"
                  onClick={() => addCash(2000)}
                  className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold border border-zinc-200 cursor-pointer"
                >
                  +₹2,000
                </button>
              </div>

              {/* Change Due Display */}
              <div className="p-3 rounded-md bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-700">Change Return to Customer:</span>
                <span
                  className={`font-mono font-bold text-sm ${
                    changeDue > 0 ? 'text-emerald-600' : 'text-zinc-600'
                  }`}
                >
                  ₹{changeDue.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* UPI MODE PREVIEW */}
          {paymentMode === 'UPI' && (
            <div className="p-4 rounded-md bg-zinc-50 border border-zinc-200 text-center space-y-2">
              <div className="w-24 h-24 mx-auto bg-white border border-zinc-300 rounded-md p-1.5 flex items-center justify-center">
                <QrCode className="w-20 h-20 text-zinc-950" />
              </div>
              <p className="font-mono text-xs font-bold text-zinc-900">vendora.store@upi</p>
              <p className="text-[11px] text-zinc-500">
                Customer scans dynamic QR with PhonePe, Google Pay, or Paytm.
              </p>
            </div>
          )}

          {/* CARD MODE PREVIEW */}
          {paymentMode === 'CARD' && (
            <div className="p-4 rounded-md bg-zinc-50 border border-zinc-200 space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold text-zinc-700">
                <span>POS EDC Terminal:</span>
                <span className="font-mono text-zinc-950 font-bold">READY (PinPad #01)</span>
              </div>
              <p className="text-zinc-500 text-[11px]">
                Insert or tap Visa, Mastercard, or RuPay on the counter EDC card reader.
              </p>
            </div>
          )}

          {/* CREDIT (KHATA) MODE CONTROLS */}
          {paymentMode === 'CREDIT' && (
            <div className="p-4 rounded-md bg-amber-50/60 border border-amber-200 text-xs space-y-2">
              {!selectedCustomer ? (
                <div className="flex items-start gap-2 text-amber-800">
                  <WarningCircle weight="bold" className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Customer Selection Required</strong>: Select or search for a customer above to bill on Khata / Udhar credit.
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="font-bold text-zinc-900">
                    Khata Credit Sale for {selectedCustomer.name}
                  </div>
                  <div className="grid grid-cols-3 gap-2 font-mono text-[11px] pt-1">
                    <div className="bg-white p-2 rounded-md border border-amber-200">
                      <span className="text-zinc-500 block">Credit Limit</span>
                      <span className="font-bold text-zinc-900">₹{selectedCustomer.creditLimit.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="bg-white p-2 rounded-md border border-amber-200">
                      <span className="text-zinc-500 block">Current Dues</span>
                      <span className="font-bold text-red-600">₹{selectedCustomer.currentCreditBalance.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="bg-white p-2 rounded-md border border-amber-200">
                      <span className="text-zinc-500 block">Available</span>
                      <span className="font-bold text-emerald-600">₹{availableCredit.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="pt-1 text-[11px] text-zinc-600">
                    New Khata Balance after this bill will be:{' '}
                    <strong className="text-zinc-950 font-mono">
                      ₹{(selectedCustomer.currentCreditBalance + grandTotal).toLocaleString('en-IN')}
                    </strong>
                  </div>

                  {isCreditExceeded && (
                    <div className="text-[11px] text-amber-700 font-semibold">
                      ⚠️ Note: This bill exceeds the customer's preset credit limit of ₹{selectedCustomer.creditLimit}. Owner approval confirmed.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-md bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onFinalize(
                paymentMode,
                paymentMode === 'CASH' ? cashTendered : grandTotal,
                selectedCustomer
              )
            }
            disabled={
              (paymentMode === 'CASH' && cashTendered < grandTotal) ||
              (paymentMode === 'CREDIT' && !selectedCustomer)
            }
            className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
          >
            <CheckCircle weight="bold" className="w-4 h-4" />
            <span>Complete & Print Bill</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { X, Check, CreditCard, Sparkle } from '@phosphor-icons/react';
import { api } from '../../lib/api';

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanCode?: string;
}

const UPGRADE_PLANS = [
  {
    code: 'STARTER',
    name: 'Starter',
    monthlyPrice: 999,
    annualPrice: 9990,
    features: ['1 Store Location', '1 Cashier/User', '10,000 bills/mo', 'Thermal Receipt Printing', 'Cloud Backup'],
  },
  {
    code: 'GROWTH',
    name: 'Growth',
    monthlyPrice: 1799,
    annualPrice: 17990,
    isPopular: true,
    features: ['2 Store Locations', '5 Cashier Accounts', '50,000 bills/mo', 'Full Khata & CRM', 'GST Reports (GSTR-1/3B)'],
  },
  {
    code: 'BUSINESS',
    name: 'Business',
    monthlyPrice: 3499,
    annualPrice: 34990,
    features: ['5 Store Locations', 'Unlimited Users', 'Unlimited Bills', 'Multi-Outlet Transfers', 'Executive Analytics'],
  },
];

export function PlanUpgradeModal({ isOpen, onClose, currentPlanCode }: PlanUpgradeModalProps) {
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [selectedPlan, setSelectedPlan] = useState<string>('GROWTH');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setIsRedirecting(true);
    setError(null);
    try {
      const successUrl = `${window.location.origin}/settings?payment=success&session_id={CHECKOUT_SESSION_ID}&tab=general`;
      const cancelUrl = `${window.location.origin}/settings?payment=cancelled&tab=general`;

      const res = await api.post('/payments/checkout-session', {
        planCode: selectedPlan,
        billingCycle,
        successUrl,
        cancelUrl,
      });

      const checkoutUrl = res.data?.data?.url || res.data?.url;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No checkout URL returned from server.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to start Stripe checkout.');
      setIsRedirecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-md max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkle weight="bold" className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="font-bold text-sm text-zinc-950">Upgrade Store Subscription</h3>
              <p className="text-[11px] text-zinc-500">Scale your store with secure, instant Stripe billing</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-zinc-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Billing Cycle Switcher */}
        <div className="px-6 pt-4 pb-2 flex justify-center">
          <div className="inline-flex items-center p-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-xs">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-3 py-1 font-semibold rounded-sm transition-colors cursor-pointer ${
                billingCycle === 'MONTHLY' ? 'bg-zinc-950 text-white' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('ANNUAL')}
              className={`px-3 py-1 font-semibold rounded-sm transition-colors cursor-pointer flex items-center gap-1 ${
                billingCycle === 'ANNUAL' ? 'bg-zinc-950 text-white' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded-full font-bold">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {error && <div className="p-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {UPGRADE_PLANS.map((plan) => {
              const price = billingCycle === 'ANNUAL' ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice;
              const isCurrent = currentPlanCode === plan.code;
              const isSelected = selectedPlan === plan.code;

              return (
                <div
                  key={plan.code}
                  onClick={() => !isCurrent && setSelectedPlan(plan.code)}
                  className={`p-3.5 rounded-md border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-red-600 bg-red-50/20 ring-1 ring-red-600'
                      : isCurrent
                      ? 'border-zinc-200 bg-zinc-50 opacity-60 cursor-default'
                      : 'border-zinc-200 hover:border-zinc-300 bg-white'
                  }`}
                >
                  {plan.isPopular && (
                    <span className="absolute -top-2 right-3 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Popular
                    </span>
                  )}
                  <div>
                    <h4 className="font-bold text-xs text-zinc-900">{plan.name}</h4>
                    <div className="mt-1 mb-2">
                      <span className="text-lg font-black font-mono text-zinc-950">₹{price}</span>
                      <span className="text-[10px] text-zinc-400">/mo</span>
                      {billingCycle === 'ANNUAL' && (
                        <div className="text-[10px] text-zinc-500 font-mono">Billed ₹{plan.annualPrice}/yr</div>
                      )}
                    </div>
                    <ul className="space-y-1.5 pt-2 border-t border-zinc-100 text-[11px] text-zinc-600">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-red-600 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-2">
                    {isCurrent ? (
                      <span className="text-[10px] text-zinc-400 font-semibold block text-center">Current Plan</span>
                    ) : (
                      <span className={`text-[11px] font-bold block text-center ${isSelected ? 'text-red-600' : 'text-zinc-500'}`}>
                        {isSelected ? '✓ Selected' : 'Select Plan'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
            <CreditCard weight="bold" className="w-4 h-4 text-zinc-500" />
            <span className="text-[11px]">Powered by Stripe Test Checkout</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={isRedirecting}
              className="px-4 py-1.5 rounded-md border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleCheckout}
              disabled={isRedirecting || selectedPlan === currentPlanCode}
              className="px-4 py-1.5 rounded-md bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs cursor-pointer transition-colors"
            >
              {isRedirecting ? 'Opening Stripe...' : 'Proceed to Checkout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


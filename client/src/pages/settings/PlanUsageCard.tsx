import { useState } from 'react';
import { Medal, Sparkle, CheckCircle, Clock, CreditCard, Check, Receipt } from '@phosphor-icons/react';
import { Card, CardHeader, UsageMeter } from '../../components/ui';
import { formatDate } from '@/utils';
import type { AccountOverview } from '../../types/account.types';
import { PlanUpgradeModal } from './PlanUpgradeModal';
import { SubscriptionInvoicesModal } from './SubscriptionInvoicesModal';

export function PlanUsageCard({ data }: { data: AccountOverview }) {
  const { plan, usage, store } = data;
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isInvoicesOpen, setIsInvoicesOpen] = useState(false);
  const isPaidActive = !plan.isTrial && plan.status === 'ACTIVE';

  return (
    <Card>
      <CardHeader icon={<Medal />} title="Plan & billing" />

      {/* Plan Header & Badges */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-black text-zinc-950">{plan.name}</h4>
            {isPaidActive ? (
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[0.6875rem] font-bold inline-flex items-center gap-1">
                <CheckCircle weight="fill" className="w-3.5 h-3.5 text-emerald-600" />
                Active · Paid
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[0.6875rem] font-bold inline-flex items-center gap-1">
                <Clock weight="fill" className="w-3.5 h-3.5 text-amber-600" />
                Free Trial
              </span>
            )}
          </div>
          {plan.tagline && <p className="text-[0.6875rem] text-zinc-500 mt-0.5">{plan.tagline}</p>}
        </div>

        {plan.monthlyPrice !== undefined && plan.monthlyPrice > 0 && (
          <div className="text-right">
            <span className="text-sm font-black text-zinc-950">₹{plan.monthlyPrice.toLocaleString('en-IN')}</span>
            <span className="text-[0.625rem] text-zinc-400 block font-medium">/ month</span>
          </div>
        )}
      </div>

      {/* Subscription Timeline & Billing Method */}
      <div className="mb-4 p-2.5 rounded-md bg-zinc-50 border border-zinc-200 space-y-1 text-xs text-zinc-600">
        <div className="flex items-center justify-between">
          <span className="text-zinc-500">Billing Renewal:</span>
          <span className="font-semibold text-zinc-900">
            {plan.expiresAt ? formatDate(plan.expiresAt) : 'Perpetual'}
            {plan.daysRemaining !== null && plan.daysRemaining !== undefined && (
              <span className="text-zinc-500 font-normal ml-1">({plan.daysRemaining} days left)</span>
            )}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-500">Payment Gateway:</span>
          <span className="font-semibold text-zinc-900 inline-flex items-center gap-1">
            <CreditCard weight="fill" className="w-3.5 h-3.5 text-zinc-700" />
            {isPaidActive ? 'Stripe Test Checkout' : 'Trial Period (No Card)'}
          </span>
        </div>
      </div>

      {/* Quota Meters */}
      <div className="space-y-3 mb-4">
        <UsageMeter label="Users" used={usage.users.used} limit={usage.users.limit} caption="active logins, admin included" />
        <UsageMeter label="Outlets" used={usage.outlets.used} limit={usage.outlets.limit} caption="locations" />
        <UsageMeter
          label="Bills"
          used={usage.billsThisMonth.used}
          limit={usage.billsThisMonth.limit}
          caption={plan.startsAt ? `this month · active since ${formatDate(plan.startsAt)}` : 'this month'}
        />
      </div>

      {/* Included Features Checklist */}
      {plan.features && plan.features.length > 0 && (
        <div className="mb-4 pt-3 border-t border-zinc-100">
          <p className="text-[0.6875rem] font-bold text-zinc-500 uppercase tracking-wider mb-2">Included in {plan.name}:</p>
          <ul className="space-y-1">
            {plan.features.slice(0, 4).map((feature, idx) => (
              <li key={idx} className="flex items-center gap-1.5 text-xs text-zinc-700">
                <Check weight="bold" className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upgrade CTA & Billing History */}
      <div className="pt-3 border-t border-zinc-200 flex items-center justify-between gap-2">
        <button
          onClick={() => setIsInvoicesOpen(true)}
          className="px-2.5 py-1.5 rounded-md border border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-semibold text-xs cursor-pointer transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Receipt className="w-3.5 h-3.5 text-zinc-500" />
          <span>Billing History</span>
        </button>

        <button
          onClick={() => setIsUpgradeOpen(true)}
          className="px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Sparkle weight="bold" className="w-3.5 h-3.5" />
          <span>Upgrade Plan</span>
        </button>
      </div>

      <PlanUpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        currentPlanCode={plan.code}
      />

      <SubscriptionInvoicesModal
        isOpen={isInvoicesOpen}
        onClose={() => setIsInvoicesOpen(false)}
        shopName={store?.businessName}
      />
    </Card>
  );
}

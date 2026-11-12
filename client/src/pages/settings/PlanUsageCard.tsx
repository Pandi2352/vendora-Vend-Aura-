import { useState } from 'react';
import { Medal, Sparkle } from '@phosphor-icons/react';
import { Card, CardHeader, UsageMeter } from '../../components/ui';
import { formatDate } from '@/utils';
import type { AccountOverview } from '../../types/account.types';
import { PlanUpgradeModal } from './PlanUpgradeModal';

export function PlanUsageCard({ data }: { data: AccountOverview }) {
  const { plan, usage } = data;
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  return (
    <Card>
      <CardHeader icon={<Medal />} title="Plan & usage" />
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <p className="text-lg font-extrabold text-zinc-900">{plan.name}</p>
        {plan.expiresAt && <p className="text-xs text-zinc-500">Valid until {formatDate(plan.expiresAt)}</p>}
      </div>

      <UsageMeter label="Users" used={usage.users.used} limit={usage.users.limit} caption="active logins, admin included" />
      <UsageMeter label="Outlets" used={usage.outlets.used} limit={usage.outlets.limit} caption="locations" />
      <UsageMeter
        label="Bills"
        used={usage.billsThisMonth.used}
        limit={usage.billsThisMonth.limit}
        caption={plan.startsAt ? `this month · plan since ${formatDate(plan.startsAt)}` : 'this month'}
      />

      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
        <p className="text-xs text-zinc-500">Need more bills, cashiers, or outlets?</p>
        <button
          onClick={() => setIsUpgradeOpen(true)}
          className="px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer transition-colors flex items-center gap-1.5"
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
    </Card>
  );
}

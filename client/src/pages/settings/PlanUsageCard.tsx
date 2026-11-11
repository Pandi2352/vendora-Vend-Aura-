import { Medal } from '@phosphor-icons/react';
import { Card, CardHeader, UsageMeter } from '../../components/ui';
import { formatDate } from '@/utils';
import type { AccountOverview } from '../../types/account.types';

export function PlanUsageCard({ data }: { data: AccountOverview }) {
  const { plan, usage } = data;

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

      <p className="text-xs text-zinc-500 mt-2">Your plan is managed by your provider. Contact them to upgrade.</p>
    </Card>
  );
}

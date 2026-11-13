import { Motorcycle, Clock, CheckCircle, Package } from '@phosphor-icons/react';
import type { DeliverySummary } from '../../../types/delivery.types';

interface DeliveryKpiStripProps {
  summary: DeliverySummary;
}

export function DeliveryKpiStrip({ summary }: DeliveryKpiStripProps) {
  const cards = [
    {
      label: 'Total Orders',
      value: summary.total,
      icon: Package,
      color: 'text-zinc-700 bg-zinc-100',
    },
    {
      label: 'Pending Dispatch',
      value: summary.pendingDispatch,
      icon: Clock,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      label: 'Out for Delivery',
      value: summary.outForDelivery,
      icon: Motorcycle,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
    },
    {
      label: 'Delivered Packages',
      value: summary.delivered,
      icon: CheckCircle,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className="bg-white border border-zinc-200 rounded-lg p-3.5 flex items-center justify-between"
          >
            <div>
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{c.label}</p>
              <p className="text-xl font-black text-zinc-900 mt-0.5">{c.value}</p>
            </div>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${c.color}`}>
              <Icon weight="bold" className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

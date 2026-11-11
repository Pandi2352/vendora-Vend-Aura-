import { Link } from 'react-router-dom';
import { Receipt } from '@phosphor-icons/react';
import { Card, CardHeader } from '../../components/ui';
import { ROUTES } from '../../config/routes';
import { formatDateTime, formatInr } from '@/utils';
import type { OrderItemRecord } from '../../types/pos.types';

export function RecentBillsCard({ orders, isLoading }: { orders: OrderItemRecord[]; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader
        icon={<Receipt />}
        title="Recent bills"
        action={
          <Link to={ROUTES.ORDERS} className="text-xs font-semibold text-primary-600 hover:underline">
            View all
          </Link>
        }
      />
      {isLoading && orders.length === 0 ? (
        <p className="text-sm text-zinc-400 py-6 text-center">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-zinc-400 py-6 text-center">No bills yet. Your first sale will show here.</p>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {orders.map((o) => (
            <li key={o.id ?? o._id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900 font-mono">{o.invoiceNumber}</p>
                <p className="text-xs text-zinc-500 truncate">
                  {o.customerName || 'Walk-in'} · {o.itemsCount} items · {formatDateTime(o.createdAt)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-zinc-900">{formatInr(o.grandTotal)}</p>
                <p className="text-[11px] font-semibold text-zinc-400">{o.paymentMode}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

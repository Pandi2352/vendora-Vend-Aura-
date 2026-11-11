import { Link } from 'react-router-dom';
import { WarningCircle } from '@phosphor-icons/react';
import { Card, CardHeader } from '../../components/ui';
import { ROUTES } from '../../config/routes';
import type { InventoryValuationData } from '../../types/reports.types';

const MAX_ROWS = 6;

export function StockAlertsCard({ inventory }: { inventory: InventoryValuationData }) {
  const items = inventory.lowStockItems.slice(0, MAX_ROWS);
  const { lowStockCount, outOfStockCount } = inventory.summary;

  return (
    <Card>
      <CardHeader
        icon={<WarningCircle />}
        title="Stock alerts"
        description={`${lowStockCount} low · ${outOfStockCount} out of stock`}
        action={
          <Link to={ROUTES.REPORTS_INVENTORY} className="text-xs font-semibold text-primary-600 hover:underline">
            Inventory
          </Link>
        }
      />
      {items.length === 0 ? (
        <p className="text-sm text-zinc-400 py-6 text-center">All products are above their reorder level.</p>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900 truncate">{item.name}</p>
                <p className="text-xs text-zinc-500">{item.category}</p>
              </div>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                  item.stock <= 0
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                {item.stock <= 0 ? 'Out of stock' : `${item.stock} left`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

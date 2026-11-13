import { useSearchParams } from 'react-router-dom';
import { Tabs, type TabItem } from '../ui';
import type { InventoryValuationData } from '../../types/reports.types';
import { InventoryValuationView } from './stock/InventoryValuationView';
import { StockMovementLedgerTab } from './stock/StockMovementLedgerTab';
import { PhysicalAuditTab } from './stock/PhysicalAuditTab';
import { WastageWriteOffTab } from './stock/WastageWriteOffTab';

type InventorySubTab = 'valuation' | 'ledger' | 'physical' | 'wastage';

const SUBTAB_ITEMS: TabItem<InventorySubTab>[] = [
  { value: 'valuation', label: 'Valuation & Low Stock' },
  { value: 'ledger', label: 'Stock Movement Ledger' },
  { value: 'physical', label: 'Physical Count Audit' },
  { value: 'wastage', label: 'Wastage & Damage Write-Offs' },
];

interface InventoryAnalyticsTabProps {
  data: InventoryValuationData | null;
  isLoading: boolean;
}

export function InventoryAnalyticsTab({ data, isLoading }: InventoryAnalyticsTabProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');

  const currentSubTab: InventorySubTab =
    rawTab === 'ledger' || rawTab === 'physical' || rawTab === 'wastage'
      ? rawTab
      : 'valuation';

  const handleTabChange = (nextTab: InventorySubTab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextTab === 'valuation') {
        next.delete('tab');
      } else {
        next.set('tab', nextTab);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Sub-tab navigation */}
      <div className="bg-white p-2.5 rounded-md border border-zinc-200">
        <Tabs<InventorySubTab>
          items={SUBTAB_ITEMS}
          value={currentSubTab}
          onChange={handleTabChange}
        />
      </div>

      {/* Sub-tab content */}
      <div>
        {currentSubTab === 'valuation' && (
          <InventoryValuationView data={data} isLoading={isLoading} />
        )}
        {currentSubTab === 'ledger' && <StockMovementLedgerTab />}
        {currentSubTab === 'physical' && <PhysicalAuditTab />}
        {currentSubTab === 'wastage' && <WastageWriteOffTab />}
      </div>
    </div>
  );
}

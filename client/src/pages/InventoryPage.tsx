import { useSearchParams } from 'react-router-dom';
import { Package } from '@phosphor-icons/react';
import { Tabs } from '@/components/ui';
import { ItemCatalogTab } from '@/modules/inventory/ItemCatalogTab';
import { CategoriesTab } from '@/modules/inventory/CategoriesTab';
import { OpeningStockTab } from '@/modules/inventory/OpeningStockTab';

type InventoryTab = 'catalog' | 'categories' | 'stock';

export function InventoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const currentTab: InventoryTab = rawTab === 'categories' || rawTab === 'stock' ? rawTab : 'catalog';

  const handleTabChange = (tabId: InventoryTab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tabId === 'catalog') {
        next.delete('tab');
      } else {
        next.set('tab', tabId);
      }
      return next;
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 overflow-y-auto p-4 sm:p-6 font-sans">
      <div className="mb-4">
        <h2 className="text-lg font-black text-zinc-950 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary-600" />
          <span>Inventory Master & Catalog</span>
        </h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Manage product inventory, retail pricing, multi-tier categories, and opening stock counts.
        </p>
      </div>

      <Tabs<InventoryTab>
        className="mb-4 self-start"
        value={currentTab}
        onChange={handleTabChange}
        items={[
          { value: 'catalog', label: 'Item Catalog' },
          { value: 'categories', label: 'Categories & Brands' },
          { value: 'stock', label: 'Opening Stock' },
        ]}
      />

      {currentTab === 'catalog' && <ItemCatalogTab />}
      {currentTab === 'categories' && <CategoriesTab />}
      {currentTab === 'stock' && <OpeningStockTab />}
    </div>
  );
}

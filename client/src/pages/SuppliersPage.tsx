import { SuppliersView } from '../components/SuppliersView';
import { usePosSession } from '../hooks/usePosSession';

/** Suppliers and goods-received entries; a GRN refreshes the shared catalog stock. */
export function SuppliersPage() {
  const { products, fetchCatalog } = usePosSession();

  return (
    <div className="h-full flex flex-col">
      <SuppliersView products={products} onInwardStockCompleted={fetchCatalog} />
    </div>
  );
}

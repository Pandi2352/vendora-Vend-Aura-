import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowClockwise, Package, Plus, Truck } from '@phosphor-icons/react';
import { api, unwrap, getErrorMessage } from '@/lib/api';
import { Button, Tabs } from '@/components/ui';
import type { SupplierItem, PurchaseItemRecord, ProductItem } from '@/types/pos.types';
import { SuppliersKpiStrip } from './suppliers/SuppliersKpiStrip';
import { SuppliersTable } from './suppliers/SuppliersTable';
import { InwardsTable } from './suppliers/InwardsTable';
import { AddSupplierModal } from './suppliers/AddSupplierModal';
import { InwardStockModal } from './suppliers/InwardStockModal';
import { SettleDuesModal } from './suppliers/SettleDuesModal';

interface SuppliersViewProps {
  products: ProductItem[];
  onInwardStockCompleted: () => void;
}

type SubTab = 'suppliers' | 'inwards';

export function SuppliersView({ products, onInwardStockCompleted }: SuppliersViewProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const subTab: SubTab = rawTab === 'inwards' ? 'inwards' : 'suppliers';

  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [purchases, setPurchases] = useState<PurchaseItemRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [suppliersError, setSuppliersError] = useState<string | null>(null);
  const [purchasesError, setPurchasesError] = useState<string | null>(null);

  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);
  const [supplierToPay, setSupplierToPay] = useState<SupplierItem | null>(null);

  const handleSubTabChange = (nextTab: SubTab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextTab === 'suppliers') {
        next.delete('tab');
      } else {
        next.set('tab', nextTab);
      }
      return next;
    });
  };

  const handleCloseInwardModal = () => {
    setIsInwardModalOpen(false);
    if (searchParams.get('action') === 'inward') {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('action');
        return next;
      });
    }
  };

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'inward') {
      setIsInwardModalOpen(true);
    }
  }, [searchParams]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    const [supRes, purRes] = await Promise.allSettled([
      api.get('/suppliers', { params: { limit: 100 } }),
      api.get('/suppliers/inward/history', { params: { limit: 100 } }),
    ]);

    if (supRes.status === 'fulfilled') {
      const list = unwrap<Array<SupplierItem & { _id?: string }>>(supRes.value);
      setSuppliers(Array.isArray(list) ? list.map((s) => ({ ...s, id: s.id ?? (s._id as string) })) : []);
      setSuppliersError(null);
    } else {
      setSuppliersError(getErrorMessage(supRes.reason, 'Failed to load suppliers.'));
    }
    if (purRes.status === 'fulfilled') {
      const list = unwrap<PurchaseItemRecord[]>(purRes.value);
      setPurchases(Array.isArray(list) ? list : []);
      setPurchasesError(null);
    } else {
      setPurchasesError(getErrorMessage(purRes.reason, 'Failed to load inward history.'));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchAllData();
  }, [fetchAllData]);

  const handleInwardSuccess = () => {
    void fetchAllData();
    onInwardStockCompleted();
  };

  const totalPayablesDue = suppliers.reduce((sum, s) => sum + s.balanceDue, 0);
  const totalInwardedValue = purchases.reduce((sum, p) => sum + p.grandTotal, 0);

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 overflow-y-auto p-4 sm:p-6 font-sans">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-black text-zinc-950 flex items-center gap-2">
            <Truck aria-hidden className="w-5 h-5 text-primary-600" />
            <span>Suppliers & Inward Inventory (GRN)</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Procure stock from distributors, log Goods Receipt Notes (GRN), and manage vendor payables.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => void fetchAllData()}
            disabled={loading}
            icon={<ArrowClockwise aria-hidden className={loading ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />}
          >
            Refresh
          </Button>
          <Button variant="secondary" onClick={() => setIsAddSupplierOpen(true)} icon={<Plus aria-hidden weight="bold" className="w-4 h-4" />}>
            New Supplier
          </Button>
          <Button onClick={() => setIsInwardModalOpen(true)} icon={<Package aria-hidden weight="bold" className="w-4 h-4" />}>
            Inward Stock (GRN)
          </Button>
        </div>
      </div>

      <SuppliersKpiStrip
        totalPayablesDue={totalPayablesDue}
        totalInwardedValue={totalInwardedValue}
        inwardsCount={purchases.length}
        suppliersCount={suppliers.length}
      />

      <Tabs<SubTab>
        className="mb-4 self-start"
        value={subTab}
        onChange={handleSubTabChange}
        items={[
          { value: 'suppliers', label: `Suppliers Directory (${suppliers.length})` },
          { value: 'inwards', label: `Inward GRN Shipments (${purchases.length})` },
        ]}
      />

      {subTab === 'suppliers' ? (
        <SuppliersTable
          suppliers={suppliers}
          loading={loading}
          error={suppliersError}
          onRetry={() => void fetchAllData()}
          onPayDues={setSupplierToPay}
        />
      ) : (
        <InwardsTable purchases={purchases} loading={loading} error={purchasesError} onRetry={() => void fetchAllData()} />
      )}

      <AddSupplierModal isOpen={isAddSupplierOpen} onClose={() => setIsAddSupplierOpen(false)} onSupplierAdded={fetchAllData} />

      <InwardStockModal
        isOpen={isInwardModalOpen}
        suppliers={suppliers}
        products={products}
        onClose={handleCloseInwardModal}
        onInwardSuccess={handleInwardSuccess}
      />

      <SettleDuesModal supplier={supplierToPay} onClose={() => setSupplierToPay(null)} onPaymentSuccess={fetchAllData} />
    </div>
  );
}

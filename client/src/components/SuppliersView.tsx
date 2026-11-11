import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Truck, Plus, MagnifyingGlass, ArrowClockwise, Package } from '@phosphor-icons/react';
import type { SupplierItem, PurchaseItemRecord, ProductItem } from '../types/pos.types';
import { SuppliersKpiStrip } from './suppliers/SuppliersKpiStrip';
import { SuppliersTable } from './suppliers/SuppliersTable';
import { InwardsTable } from './suppliers/InwardsTable';
import { AddSupplierModal } from './suppliers/AddSupplierModal';
import { InwardStockModal } from './suppliers/InwardStockModal';
import { SettleDuesModal } from './suppliers/SettleDuesModal';

const API_BASE = 'http://localhost:5000/api/v1';

interface SuppliersViewProps {
  tenantId?: string;
  authToken: string | null;
  products: ProductItem[];
  onInwardStockCompleted: () => void;
}

export function SuppliersView({
  tenantId,
  authToken,
  products,
  onInwardStockCompleted,
}: SuppliersViewProps) {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [purchases, setPurchases] = useState<PurchaseItemRecord[]>([]);
  const [subTab, setSubTab] = useState<'suppliers' | 'inwards'>('suppliers');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Modals state
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);
  const [selectedSupForPay, setSelectedSupForPay] = useState<SupplierItem | null>(null);

  const fetchAllData = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const [supRes, purRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/suppliers?tenantId=${tenantId}`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        }),
        axios.get(`${API_BASE}/suppliers/inward/history?tenantId=${tenantId}`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        }),
      ]);

      if (supRes.status === 'fulfilled' && Array.isArray(supRes.value.data?.data)) {
        setSuppliers(supRes.value.data.data);
      }
      if (purRes.status === 'fulfilled' && Array.isArray(purRes.value.data?.data)) {
        setPurchases(purRes.value.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch suppliers/purchases:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, authToken]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleInwardSuccess = () => {
    fetchAllData();
    onInwardStockCompleted();
  };

  const totalPayablesDue = suppliers.reduce((sum, s) => sum + s.balanceDue, 0);
  const totalInwardedValue = purchases.reduce((sum, p) => sum + p.grandTotal, 0);

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredPurchases = purchases.filter(
    (p) =>
      p.grnNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(search.toLowerCase()) ||
      (p.supplierInvoiceNumber && p.supplierInvoiceNumber.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 overflow-hidden p-4 sm:p-6 select-none font-sans">
      {/* Top Banner & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-black text-zinc-950 flex items-center gap-2">
            <Truck className="w-5 h-5 text-red-600" />
            <span>Suppliers & Inward Inventory (GRN)</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Procure stock from distributors, log Goods Receipt Notes (GRN), and manage vendor payables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAllData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-zinc-300 hover:border-zinc-400 text-zinc-700 text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            <ArrowClockwise className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-600' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsAddSupplierOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-zinc-300 hover:border-zinc-400 text-zinc-800 text-xs font-semibold cursor-pointer"
          >
            <Plus weight="bold" className="w-3.5 h-3.5" />
            <span>New Supplier</span>
          </button>
          <button
            onClick={() => setIsInwardModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
          >
            <Package weight="bold" className="w-3.5 h-3.5" />
            <span>Inward Stock (GRN)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <SuppliersKpiStrip
        totalPayablesDue={totalPayablesDue}
        totalInwardedValue={totalInwardedValue}
        inwardsCount={purchases.length}
        suppliersCount={suppliers.length}
      />

      {/* Sub-Tabs: Suppliers Directory vs GRN Shipments */}
      <div className="bg-white p-3 rounded-md border border-zinc-200 mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setSubTab('suppliers')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
              subTab === 'suppliers' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            Suppliers Directory ({suppliers.length})
          </button>
          <button
            onClick={() => setSubTab('inwards')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
              subTab === 'inwards' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            Inward GRN Shipments ({purchases.length})
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <MagnifyingGlass className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              subTab === 'suppliers' ? 'Search suppliers by name, phone...' : 'Search GRN #, supplier, bill #...'
            }
            className="w-full pl-9 pr-3 py-1.5 rounded-md border border-zinc-200 text-xs text-zinc-900 focus:border-red-600 outline-none"
          />
        </div>
      </div>

      {/* Content Table */}
      <div className="flex-1 bg-white rounded-md border border-zinc-200 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {subTab === 'suppliers' ? (
            <SuppliersTable
              suppliers={filteredSuppliers}
              loading={loading}
              onPayDues={(s) => setSelectedSupForPay(s)}
            />
          ) : (
            <InwardsTable
              purchases={filteredPurchases}
              loading={loading}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <AddSupplierModal
        tenantId={tenantId}
        authToken={authToken}
        isOpen={isAddSupplierOpen}
        onClose={() => setIsAddSupplierOpen(false)}
        onSupplierAdded={fetchAllData}
      />

      <InwardStockModal
        tenantId={tenantId}
        authToken={authToken}
        isOpen={isInwardModalOpen}
        suppliers={suppliers}
        products={products}
        onClose={() => setIsInwardModalOpen(false)}
        onInwardSuccess={handleInwardSuccess}
      />

      <SettleDuesModal
        tenantId={tenantId}
        authToken={authToken}
        supplier={selectedSupForPay}
        onClose={() => setSelectedSupForPay(null)}
        onPaymentSuccess={fetchAllData}
      />
    </div>
  );
}

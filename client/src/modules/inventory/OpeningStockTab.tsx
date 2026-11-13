import { useCallback, useEffect, useState } from 'react';
import { ArrowClockwise, Check, FloppyDisk } from '@phosphor-icons/react';
import { api, getErrorMessage, unwrap } from '@/lib/api';
import { Badge, Button } from '@/components/ui';
import { DataTable, type Column } from '@/components/tables';
import { useToast } from '@/hooks/useToast';
import { formatInr } from '@/utils';
import type { ProductItem } from '@/types/pos.types';

interface StockRow extends ProductItem {
  editedStock?: number;
  editedCost?: number;
}

export function OpeningStockTab() {
  const toast = useToast();
  const [rows, setRows] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/catalog/products');
      const data = unwrap<ProductItem[]>(res);
      if (Array.isArray(data)) {
        setRows(data.map((p) => ({ ...p, editedStock: p.stock ?? 0, editedCost: p.costPrice ?? 0 })));
      }
    } catch (err) {
      toast.error('Failed to load stock data', getErrorMessage(err, 'Could not fetch catalog.'));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleStockChange = (id: string, val: number) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, editedStock: Math.max(0, val) } : r)));
  };

  const handleCostChange = (id: string, val: number) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, editedCost: Math.max(0, val) } : r)));
  };

  const handleSaveRow = async (row: StockRow) => {
    setSavingId(row.id);
    try {
      await api.post('/catalog/opening-stock', {
        productId: row.id,
        stock: row.editedStock ?? 0,
        costPrice: row.editedCost ?? 0,
      });
      toast.success('Stock updated', `Opening stock for "${row.name}" saved.`);
      setRows((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, stock: row.editedStock, costPrice: row.editedCost } : r,
        ),
      );
    } catch (err) {
      toast.error('Failed to save stock', getErrorMessage(err, 'Could not update stock level.'));
    } finally {
      setSavingId(null);
    }
  };

  const columns: Column<StockRow>[] = [
    {
      key: 'name',
      header: 'Product Details',
      sortValue: (r) => r.name.toLowerCase(),
      render: (r) => (
        <div>
          <div className="font-bold text-zinc-950">{r.name}</div>
          <div className="font-mono text-[0.6875rem] text-zinc-400">Barcode: {r.barcode} · {r.category}</div>
        </div>
      ),
    },
    {
      key: 'currentStock',
      header: 'Current Stock',
      align: 'right',
      sortValue: (r) => r.stock ?? 0,
      render: (r) => (
        <Badge tone={(r.stock ?? 0) <= 0 ? 'danger' : (r.stock ?? 0) <= 10 ? 'warning' : 'neutral'} dot>
          {r.stock ?? 0} units
        </Badge>
      ),
    },
    {
      key: 'newStock',
      header: 'Opening Stock Count',
      align: 'right',
      render: (r) => (
        <input
          type="number"
          min={0}
          value={r.editedStock ?? 0}
          onChange={(e) => handleStockChange(r.id, Number(e.target.value))}
          className="w-28 text-right font-mono font-bold px-2 py-1 text-sm bg-white border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      ),
    },
    {
      key: 'costPrice',
      header: 'Unit Cost Price (₹)',
      align: 'right',
      render: (r) => (
        <input
          type="number"
          min={0}
          step="0.01"
          value={r.editedCost ?? 0}
          onChange={(e) => handleCostChange(r.id, Number(e.target.value))}
          className="w-28 text-right font-mono px-2 py-1 text-sm bg-white border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      ),
    },
    {
      key: 'valuation',
      header: 'Total Valuation',
      align: 'right',
      sortValue: (r) => (r.editedStock ?? 0) * (r.editedCost ?? 0),
      render: (r) => (
        <span className="font-mono font-bold text-zinc-900">
          {formatInr((r.editedStock ?? 0) * (r.editedCost ?? 0))}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Save',
      align: 'center',
      render: (r) => {
        const isDirty = r.editedStock !== r.stock || r.editedCost !== r.costPrice;
        const isSaving = savingId === r.id;
        return (
          <Button
            size="sm"
            variant={isDirty ? 'primary' : 'secondary'}
            onClick={() => void handleSaveRow(r)}
            disabled={isSaving || !isDirty}
            icon={isDirty ? <FloppyDisk weight="bold" /> : <Check />}
          >
            {isSaving ? 'Saving…' : isDirty ? 'Save' : 'Synced'}
          </Button>
        );
      },
    },
  ];

  const totalValuation = rows.reduce((sum, r) => sum + (r.editedStock ?? 0) * (r.editedCost ?? 0), 0);
  const totalUnits = rows.reduce((sum, r) => sum + (r.editedStock ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-md border border-zinc-200">
        <div>
          <div className="text-xs text-zinc-500">Opening Inventory Summary</div>
          <div className="flex items-center gap-4 mt-0.5">
            <span className="text-sm font-bold text-zinc-900">{rows.length} Items</span>
            <span className="text-sm font-bold text-zinc-900">{totalUnits.toLocaleString('en-IN')} Total Units</span>
            <span className="text-sm font-extrabold text-primary-600 font-mono">
              Valuation: {formatInr(totalValuation)}
            </span>
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={() => void loadData()}
          disabled={loading}
          icon={<ArrowClockwise className={loading ? 'animate-spin' : ''} />}
        >
          Refresh Stock
        </Button>
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(r) => r.id}
        loading={loading}
        searchText={(r) => `${r.name} ${r.barcode} ${r.category}`}
        searchPlaceholder="Filter items to adjust opening quantities or cost…"
        emptyTitle="No inventory items found"
        emptyDescription="Add products in Item Catalog first to record opening stock."
      />
    </div>
  );
}

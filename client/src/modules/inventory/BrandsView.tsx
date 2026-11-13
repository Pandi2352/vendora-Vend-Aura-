import { useCallback, useEffect, useState } from 'react';
import { PencilSimple, Plus, Trash, ArrowClockwise, Tag } from '@phosphor-icons/react';
import { api, getErrorMessage, unwrap } from '@/lib/api';
import { Badge, Button } from '@/components/ui';
import { DataTable, RowActions, type Column, type RowAction } from '@/components/tables';
import { useConfirm } from '@/hooks/useConfirm';
import { useToast } from '@/hooks/useToast';
import { BrandFormModal, type BrandItem } from './BrandFormModal';

export function BrandsView() {
  const toast = useToast();
  const confirm = useConfirm();
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const loadBrands = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/catalog/brands');
      const data = unwrap<BrandItem[]>(res);
      setBrands(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load brands', getErrorMessage(err, 'Could not fetch brand list.'));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadBrands();
  }, [loadBrands]);

  const handleDelete = async (brand: BrandItem) => {
    const ok = await confirm({
      title: `Delete brand "${brand.name}"?`,
      message: 'Products associated with this brand will remain intact.',
      confirmLabel: 'Delete brand',
      danger: true,
    });
    if (!ok) return;

    try {
      await api.delete(`/catalog/brands/${brand.id}`);
      toast.success('Brand removed', `"${brand.name}" deleted.`);
      void loadBrands();
    } catch (err) {
      toast.error('Delete failed', getErrorMessage(err, 'Could not delete brand.'));
    }
  };

  const columns: Column<BrandItem>[] = [
    {
      key: 'name',
      header: 'Brand / Manufacturer',
      sortValue: (b) => b.name.toLowerCase(),
      render: (b) => (
        <div>
          <span className="font-bold text-zinc-950 block">{b.name}</span>
          {b.description && <span className="text-xs text-zinc-500">{b.description}</span>}
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Code',
      sortValue: (b) => b.code ?? '',
      render: (b) => <span className="font-mono text-xs text-zinc-600">{b.code || '—'}</span>,
    },
    {
      key: 'order',
      header: 'Display Order',
      align: 'right',
      sortValue: (b) => b.displayOrder ?? 0,
      render: (b) => <span className="font-mono text-zinc-700">{b.displayOrder ?? 0}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: () => (
        <Badge tone="success" dot>
          Active
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (b) => {
        const actions: RowAction[] = [
          {
            label: `Edit ${b.name}`,
            icon: <PencilSimple weight="bold" />,
            tone: 'primary',
            onClick: () => setEditingBrand(b),
          },
          {
            label: `Delete ${b.name}`,
            icon: <Trash weight="bold" />,
            tone: 'danger',
            onClick: () => void handleDelete(b),
          },
        ];
        return <RowActions actions={actions} />;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-lg border border-zinc-200">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
            <Tag weight="bold" className="w-4 h-4 text-primary-600" />
            <span>Store Brands & Manufacturers</span>
          </h3>
          <p className="text-xs text-zinc-500">
            Define product brands to organize your item catalog and supplier sourcing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => void loadBrands()}
            disabled={loading}
            icon={<ArrowClockwise className={loading ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />}
          >
            Refresh
          </Button>
          <Button size="sm" onClick={() => setIsAddOpen(true)} icon={<Plus weight="bold" className="w-4 h-4" />}>
            New Brand
          </Button>
        </div>
      </div>

      <DataTable
        rows={brands}
        columns={columns}
        rowKey={(b) => b.id}
        loading={loading}
        searchText={(b) => `${b.name} ${b.code || ''}`}
        searchPlaceholder="Search brands…"
        emptyTitle="No brands added yet"
        emptyDescription="Add brands to group your products by manufacturers and vendors."
      />

      <BrandFormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSaved={() => void loadBrands()}
      />

      <BrandFormModal
        isOpen={!!editingBrand}
        brand={editingBrand}
        onClose={() => setEditingBrand(null)}
        onSaved={() => void loadBrands()}
      />
    </div>
  );
}

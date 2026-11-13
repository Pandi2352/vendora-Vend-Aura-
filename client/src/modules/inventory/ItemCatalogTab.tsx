import { useCallback, useEffect, useMemo, useState } from 'react';
import { PencilSimple, Plus, Trash, ArrowClockwise } from '@phosphor-icons/react';
import { api, getErrorMessage, unwrap } from '@/lib/api';
import { Badge, Button, Dropdown } from '@/components/ui';
import { DataTable, RowActions, type Column, type RowAction } from '@/components/tables';
import { useConfirm } from '@/hooks/useConfirm';
import { useToast } from '@/hooks/useToast';
import { formatInr } from '@/utils';
import type { ProductItem } from '@/types/pos.types';
import { ProductFormModal } from './ProductFormModal';

export function ItemCatalogTab() {
  const toast = useToast();
  const confirm = useConfirm();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/catalog/products');
      const data = unwrap<ProductItem[]>(res);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Could not load products', getErrorMessage(err, 'Failed to fetch catalog.'));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [products]);

  const categoryOptions = useMemo(
    () => [{ value: 'ALL', label: 'All Categories' }, ...categories.map((c) => ({ value: c, label: c }))],
    [categories],
  );

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'ALL') return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const handleDelete = async (prod: ProductItem) => {
    const ok = await confirm({
      title: `Delete ${prod.name}?`,
      message: 'The product will be removed from POS and catalog searches.',
      confirmLabel: 'Delete product',
      danger: true,
    });
    if (!ok) return;

    try {
      await api.delete(`/catalog/products/${prod.id}`);
      toast.success('Product deleted', `"${prod.name}" has been removed.`);
      void loadProducts();
    } catch (err) {
      toast.error('Delete failed', getErrorMessage(err, 'Could not delete product.'));
    }
  };

  const columns: Column<ProductItem>[] = [
    {
      key: 'name',
      header: 'Product Name',
      sortValue: (p) => p.name.toLowerCase(),
      render: (p) => (
        <div>
          <div className="font-bold text-zinc-950">{p.name}</div>
          <div className="font-mono text-[0.6875rem] text-zinc-400">Barcode: {p.barcode}</div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortValue: (p) => p.category.toLowerCase(),
      render: (p) => <Badge tone="neutral">{p.category}</Badge>,
    },
    {
      key: 'unitPrice',
      header: 'Selling Price',
      align: 'right',
      sortValue: (p) => p.unitPrice,
      render: (p) => <span className="font-mono font-bold text-zinc-900">{formatInr(p.unitPrice)}</span>,
    },
    {
      key: 'mrp',
      header: 'MRP',
      align: 'right',
      sortValue: (p) => p.mrp,
      render: (p) => <span className="font-mono text-zinc-500">{formatInr(p.mrp)}</span>,
    },
    {
      key: 'taxRatePercent',
      header: 'GST',
      align: 'right',
      sortValue: (p) => p.taxRatePercent,
      render: (p) => <span className="font-mono text-xs">{p.taxRatePercent}%</span>,
    },
    {
      key: 'stock',
      header: 'Stock Level',
      align: 'right',
      sortValue: (p) => p.stock ?? 0,
      render: (p) => {
        const stock = p.stock ?? 0;
        const tone = stock <= 0 ? 'danger' : stock <= 10 ? 'warning' : 'success';
        return (
          <div className="inline-flex items-center gap-1.5">
            <Badge tone={tone} dot>
              {stock} in stock
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (p) => {
        const actions: RowAction[] = [
          {
            label: `Edit ${p.name}`,
            icon: <PencilSimple weight="bold" />,
            tone: 'primary',
            onClick: () => setEditingProduct(p),
          },
          {
            label: `Delete ${p.name}`,
            icon: <Trash weight="bold" />,
            tone: 'danger',
            onClick: () => void handleDelete(p),
          },
        ];
        return <RowActions actions={actions} />;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="w-56">
          <Dropdown<string>
            aria-label="Filter by category"
            options={categoryOptions}
            value={selectedCategory}
            onChange={(v) => setSelectedCategory(v ?? 'ALL')}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => void loadProducts()}
            disabled={loading}
            icon={<ArrowClockwise className={loading ? 'animate-spin' : ''} />}
          >
            Refresh
          </Button>
          <Button onClick={() => setIsAddOpen(true)} icon={<Plus weight="bold" />}>
            Add Product
          </Button>
        </div>
      </div>

      <DataTable
        rows={filteredProducts}
        columns={columns}
        rowKey={(p) => p.id}
        loading={loading}
        searchText={(p) => `${p.name} ${p.barcode} ${p.category}`}
        searchPlaceholder="Search products by title, barcode or category…"
        emptyTitle="No products in catalog"
        emptyDescription='Click "Add Product" above to create items in your inventory.'
      />

      <ProductFormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSaved={() => void loadProducts()}
      />

      <ProductFormModal
        isOpen={!!editingProduct}
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSaved={() => void loadProducts()}
      />
    </div>
  );
}

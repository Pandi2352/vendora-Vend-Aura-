import { useCallback, useEffect, useState } from 'react';
import { PencilSimple, Plus, Trash, ArrowClockwise } from '@phosphor-icons/react';
import { api, getErrorMessage, unwrap } from '@/lib/api';
import { Badge, Button } from '@/components/ui';
import { DataTable, RowActions, type Column, type RowAction } from '@/components/tables';
import { useConfirm } from '@/hooks/useConfirm';
import { useToast } from '@/hooks/useToast';
import { CategoryFormModal, type CategoryItem } from './CategoryFormModal';

export function CategoriesTab() {
  const toast = useToast();
  const confirm = useConfirm();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/catalog/categories');
      const data = unwrap<CategoryItem[]>(res);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load categories', getErrorMessage(err, 'Could not fetch category list.'));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const handleDelete = async (cat: CategoryItem) => {
    const ok = await confirm({
      title: `Delete category "${cat.name}"?`,
      message: 'Products in this category will keep their records but the category will be unlisted.',
      confirmLabel: 'Delete category',
      danger: true,
    });
    if (!ok) return;

    try {
      await api.delete(`/catalog/categories/${cat.id}`);
      toast.success('Category removed', `"${cat.name}" deleted.`);
      void loadCategories();
    } catch (err) {
      toast.error('Delete failed', getErrorMessage(err, 'Could not delete category.'));
    }
  };

  const columns: Column<CategoryItem>[] = [
    {
      key: 'name',
      header: 'Category Name',
      sortValue: (c) => c.name.toLowerCase(),
      render: (c) => <span className="font-bold text-zinc-950">{c.name}</span>,
    },
    {
      key: 'slug',
      header: 'Slug',
      sortValue: (c) => c.slug,
      render: (c) => <span className="font-mono text-xs text-zinc-500">{c.slug}</span>,
    },
    {
      key: 'order',
      header: 'Display Order',
      align: 'right',
      sortValue: (c) => c.displayOrder ?? 0,
      render: (c) => <span className="font-mono text-zinc-700">{c.displayOrder ?? 0}</span>,
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
      render: (c) => {
        const actions: RowAction[] = [
          {
            label: `Edit ${c.name}`,
            icon: <PencilSimple weight="bold" />,
            tone: 'primary',
            onClick: () => setEditingCategory(c),
          },
          {
            label: `Delete ${c.name}`,
            icon: <Trash weight="bold" />,
            tone: 'danger',
            onClick: () => void handleDelete(c),
          },
        ];
        return <RowActions actions={actions} />;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">
          Define taxonomy and product groupings used across billing, inventory, and merchandising reports.
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => void loadCategories()}
            disabled={loading}
            icon={<ArrowClockwise className={loading ? 'animate-spin' : ''} />}
          >
            Refresh
          </Button>
          <Button onClick={() => setIsAddOpen(true)} icon={<Plus weight="bold" />}>
            Add Category
          </Button>
        </div>
      </div>

      <DataTable
        rows={categories}
        columns={columns}
        rowKey={(c) => c.id}
        loading={loading}
        searchText={(c) => `${c.name} ${c.slug}`}
        searchPlaceholder="Search categories…"
        emptyTitle="No categories created yet"
        emptyDescription='Click "Add Category" above to create product taxonomy.'
      />

      <CategoryFormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSaved={() => void loadCategories()}
      />

      <CategoryFormModal
        isOpen={!!editingCategory}
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
        onSaved={() => void loadCategories()}
      />
    </div>
  );
}

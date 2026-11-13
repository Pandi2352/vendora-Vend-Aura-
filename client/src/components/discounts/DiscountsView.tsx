import { useCallback, useEffect, useState } from 'react';
import { ArrowClockwise, PencilSimple, Plus, Tag, Trash } from '@phosphor-icons/react';
import { api, getErrorMessage, unwrap } from '@/lib/api';
import { Badge, Button } from '@/components/ui';
import { DataTable, RowActions, type Column, type RowAction } from '@/components/tables';
import { useConfirm } from '@/hooks/useConfirm';
import { useToast } from '@/hooks/useToast';
import { formatInr } from '@/utils';
import { DiscountModal, type DiscountItem } from './DiscountModal';

export function DiscountsView() {
  const toast = useToast();
  const confirm = useConfirm();
  const [discounts, setDiscounts] = useState<DiscountItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountItem | null>(null);

  const loadDiscounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/discounts');
      const data = unwrap<DiscountItem[]>(res);
      setDiscounts(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load offers', getErrorMessage(err, 'Could not fetch discount list.'));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadDiscounts();
  }, [loadDiscounts]);

  const handleDelete = async (item: DiscountItem) => {
    const ok = await confirm({
      title: `Delete offer "${item.code}"?`,
      message: 'This coupon code will immediately stop working at POS checkout counters.',
      confirmLabel: 'Delete offer',
      danger: true,
    });
    if (!ok) return;

    try {
      await api.delete(`/discounts/${item.id}`);
      toast.success('Offer deleted', `Coupon "${item.code}" was removed.`);
      void loadDiscounts();
    } catch (err) {
      toast.error('Delete failed', getErrorMessage(err));
    }
  };

  const handleToggleActive = async (item: DiscountItem) => {
    try {
      await api.patch(`/discounts/${item.id}`, { isActive: !item.isActive });
      toast.success(item.isActive ? 'Offer paused' : 'Offer activated', `${item.code} updated.`);
      void loadDiscounts();
    } catch (err) {
      toast.error('Status update failed', getErrorMessage(err));
    }
  };

  const columns: Column<DiscountItem>[] = [
    {
      key: 'code',
      header: 'Promo Code & Title',
      sortValue: (d) => d.code,
      render: (d) => (
        <div>
          <div className="font-mono font-black text-primary-700">{d.code}</div>
          <div className="text-xs text-zinc-600">{d.name}</div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Offer Type',
      render: (d) => (
        <Badge tone={d.type === 'HAPPY_HOUR' ? 'warning' : d.type === 'FLAT' ? 'primary' : 'success'} dot>
          {d.type.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'benefit',
      header: 'Discount Benefit',
      render: (d) =>
        d.type === 'FLAT' ? (
          <span className="font-mono font-bold text-zinc-900">{formatInr(d.value)} OFF</span>
        ) : (
          <span className="font-mono font-bold text-zinc-900">
            {d.value}% OFF {d.maxDiscountCap ? `(max ${formatInr(d.maxDiscountCap)})` : ''}
          </span>
        ),
    },
    {
      key: 'minOrder',
      header: 'Min Order',
      align: 'right',
      render: (d) => <span className="font-mono text-zinc-600">{d.minOrderValue ? formatInr(d.minOrderValue) : 'None'}</span>,
    },
    {
      key: 'timing',
      header: 'Window',
      render: (d) =>
        d.type === 'HAPPY_HOUR' && d.happyHourStart ? (
          <span className="font-mono text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            {d.happyHourStart} - {d.happyHourEnd}
          </span>
        ) : (
          <span className="text-xs text-zinc-400">All Day</span>
        ),
    },
    {
      key: 'redemptions',
      header: 'Redemptions',
      align: 'right',
      render: (d) => (
        <span className="font-mono text-xs">
          {d.usageCount} {d.usageLimit ? `/ ${d.usageLimit}` : ''}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (d) => (
        <button
          type="button"
          onClick={() => void handleToggleActive(d)}
          className="cursor-pointer"
        >
          <Badge tone={d.isActive ? 'success' : 'neutral'} dot>
            {d.isActive ? 'Active' : 'Paused'}
          </Badge>
        </button>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (d) => {
        const actions: RowAction[] = [
          {
            label: `Edit ${d.code}`,
            icon: <PencilSimple weight="bold" />,
            tone: 'primary',
            onClick: () => setEditingDiscount(d),
          },
          {
            label: `Delete ${d.code}`,
            icon: <Trash weight="bold" />,
            tone: 'danger',
            onClick: () => void handleDelete(d),
          },
        ];
        return <RowActions actions={actions} />;
      },
    },
  ];

  const activeCount = discounts.filter((d) => d.isActive).length;
  const totalUses = discounts.reduce((sum, d) => sum + (d.usageCount || 0), 0);

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 overflow-y-auto p-4 sm:p-6 font-sans space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-zinc-950 flex items-center gap-2">
            <Tag weight="bold" className="w-5 h-5 text-primary-600" />
            <span>Merchandising & Discount Offers</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage store promo codes, happy hours, and order-level promotional rules.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => void loadDiscounts()}
            disabled={loading}
            icon={<ArrowClockwise className={loading ? 'animate-spin' : ''} />}
          >
            Refresh
          </Button>
          <Button onClick={() => setIsAddOpen(true)} icon={<Plus weight="bold" />}>
            New Offer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-white border border-zinc-200 rounded-md">
          <div className="text-xs text-zinc-500">Active Coupons</div>
          <div className="text-lg font-black font-mono text-zinc-900 mt-0.5">{activeCount} / {discounts.length}</div>
        </div>
        <div className="p-3 bg-white border border-zinc-200 rounded-md">
          <div className="text-xs text-zinc-500">Total Redemptions</div>
          <div className="text-lg font-black font-mono text-emerald-600 mt-0.5">{totalUses}</div>
        </div>
        <div className="p-3 bg-white border border-zinc-200 rounded-md col-span-2 sm:col-span-1">
          <div className="text-xs text-zinc-500">Happy Hour Offers</div>
          <div className="text-lg font-black font-mono text-amber-600 mt-0.5">
            {discounts.filter((d) => d.type === 'HAPPY_HOUR').length}
          </div>
        </div>
      </div>

      <DataTable
        rows={discounts}
        columns={columns}
        rowKey={(d) => d.id}
        loading={loading}
        searchText={(d) => `${d.code} ${d.name} ${d.type}`}
        searchPlaceholder="Search promo code or offer title…"
        emptyTitle="No promotional offers yet"
        emptyDescription='Click "New Offer" to create your first coupon or promotional discount.'
      />

      <DiscountModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSaved={() => void loadDiscounts()}
      />

      <DiscountModal
        isOpen={!!editingDiscount}
        discount={editingDiscount}
        onClose={() => setEditingDiscount(null)}
        onSaved={() => void loadDiscounts()}
      />
    </div>
  );
}


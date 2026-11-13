import { useMemo } from 'react';
import type { Column } from '@/components/tables';
import { useLocalMaster } from '../../shared/data/useLocalMaster';
import { MasterFormDialog } from '../../shared/MasterFormDialog';
import { MasterListView } from '../../shared/MasterListView';
import { useMasterEditor } from '../../shared/useMasterEditor';
import { StatusBadge } from '../../shared/StatusBadge';
import { VoucherFields } from './VoucherFields';
import {
  VOUCHER_DEFAULTS,
  VOUCHER_RESOURCE,
  voucherSchema,
  type VoucherRecord,
  type VoucherInput,
} from './voucher.schema';

const formatValue = (r: VoucherRecord) => {
  if (r.voucherType === 'percentage') return `${r.value}% Off`;
  return `₹${r.value}`;
};

const COLUMNS: Column<VoucherRecord>[] = [
  {
    key: 'code',
    header: 'Series Code',
    sortValue: (r) => r.code,
    render: (r) => <span className="font-mono font-bold text-primary-700">{r.code}</span>,
  },
  {
    key: 'name',
    header: 'Voucher Name',
    sortValue: (r) => r.name.toLowerCase(),
    render: (r) => <span className="font-semibold text-zinc-900">{r.name}</span>,
  },
  {
    key: 'value',
    header: 'Benefit Value',
    align: 'right',
    sortValue: (r) => r.value,
    render: (r) => <span className="font-mono font-bold text-emerald-700">{formatValue(r)}</span>,
  },
  {
    key: 'minBill',
    header: 'Min Spend',
    align: 'right',
    render: (r) => <span className="font-mono text-zinc-600">₹{r.minBillAmount ?? 0}</span>,
  },
  {
    key: 'validity',
    header: 'Validity',
    render: (r) => <span className="font-mono text-zinc-600">{r.validityDays ?? 90} days</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (r) => <StatusBadge active={r.active} />,
  },
];

/** Master › Operations › Gift Voucher: promotional gift coupons and certificates. */
export function VoucherTab() {
  const list = useLocalMaster<VoucherRecord>(VOUCHER_RESOURCE);
  const editor = useMasterEditor<VoucherRecord>();
  const schema = useMemo(() => voucherSchema(list.rows, editor.editing?.id), [list.rows, editor.editing]);

  return (
    <>
      <MasterListView
        noun="gift voucher"
        description="Gift cards, promotional vouchers, and customer loyalty reward coupons."
        rows={list.rows}
        columns={COLUMNS}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        searchText={(r) => `${r.code} ${r.name} ${r.voucherType}`}
        searchPlaceholder="Search code or voucher name"
        rowLabel={(r) => r.code}
        onAdd={editor.openAdd}
        onEdit={editor.openEdit}
        onDelete={list.remove && ((r) => list.remove!(r.id))}
      />
      <MasterFormDialog
        open={editor.open}
        noun="gift voucher"
        description="A promotional gift voucher or coupon campaign"
        schema={schema}
        defaults={VOUCHER_DEFAULTS}
        initial={(editor.editing as VoucherInput | null) ?? null}
        onClose={editor.close}
        onSubmit={(values) => list.save(values, editor.editing?.id)}
      >
        <VoucherFields />
      </MasterFormDialog>
    </>
  );
}

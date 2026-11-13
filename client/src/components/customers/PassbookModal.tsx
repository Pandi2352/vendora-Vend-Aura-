import { Button, Dialog } from '@/components/ui';
import { DataTable, type Column } from '@/components/tables';
import { formatDate, formatInr } from '@/utils';
import type { CustomerItem, CustomerStatementItem } from '@/types/pos.types';

interface PassbookModalProps {
  customer: CustomerItem | null;
  statement: CustomerStatementItem[];
  loadingStatement: boolean;
  onClose: () => void;
}

const isDebit = (st: CustomerStatementItem) => st.transactionType === 'DEBIT_SALE';

const columns: Column<CustomerStatementItem>[] = [
  {
    key: 'date',
    header: 'Date',
    sortValue: (st) => new Date(st.createdAt),
    render: (st) => <span className="font-mono text-[0.6875rem] text-zinc-500">{formatDate(st.createdAt)}</span>,
  },
  {
    key: 'type',
    header: 'Transaction',
    render: (st) =>
      isDebit(st) ? (
        <span className="font-semibold text-red-600">Khata purchase</span>
      ) : (
        <span className="font-semibold text-emerald-600">Repayment ({st.paymentMode || 'Cash'})</span>
      ),
  },
  {
    key: 'ref',
    header: 'Ref ID',
    render: (st) => <span className="font-mono text-[0.6875rem] text-zinc-500">{st.referenceId}</span>,
  },
  {
    key: 'debit',
    header: 'Debit (+)',
    align: 'right',
    render: (st) => (
      <span className="font-mono font-bold text-red-600">{isDebit(st) ? formatInr(st.amount) : '—'}</span>
    ),
  },
  {
    key: 'credit',
    header: 'Credit (-)',
    align: 'right',
    render: (st) => (
      <span className="font-mono font-bold text-emerald-600">
        {st.transactionType === 'CREDIT_PAYMENT' ? formatInr(st.amount) : '—'}
      </span>
    ),
  },
  {
    key: 'balance',
    header: 'Balance',
    align: 'right',
    render: (st) => <span className="font-mono font-bold text-zinc-950">{formatInr(st.balanceAfter)}</span>,
  },
];

export function PassbookModal({ customer, statement, loadingStatement, onClose }: PassbookModalProps) {
  return (
    <Dialog
      open={!!customer}
      onClose={onClose}
      size="xl"
      title={customer ? `Khata passbook: ${customer.name}` : 'Khata passbook'}
      description={
        customer
          ? `Mobile: ${customer.phone} · Outstanding dues: ${formatInr(customer.currentCreditBalance)}`
          : undefined
      }
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close passbook
        </Button>
      }
    >
      <DataTable
        compact
        rows={statement}
        columns={columns}
        rowKey={(st) => st.id}
        loading={loadingStatement}
        emptyTitle="No transactions recorded in passbook yet."
      />
    </Dialog>
  );
}

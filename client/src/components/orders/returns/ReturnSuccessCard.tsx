import { CheckCircle } from '@phosphor-icons/react';
import type { OrderReturnRecord } from '@/types/shift-return.types';
import { REFUND_MODE_LABELS } from '@/validations/orders';
import { formatInr } from '@/utils';

interface ReturnSuccessCardProps {
  returnRecord: OrderReturnRecord;
  originalInvoiceNumber?: string;
}

export function ReturnSuccessCard({ returnRecord, originalInvoiceNumber }: ReturnSuccessCardProps) {
  return (
    <div className="py-8 text-center space-y-3">
      <CheckCircle weight="fill" className="w-14 h-14 text-emerald-500 mx-auto" />
      <h4 className="font-bold text-base text-zinc-900">Return processed</h4>
      <p className="text-xs text-zinc-600">
        Return voucher: <span className="font-mono font-bold text-primary-700">{returnRecord.returnNumber}</span>
      </p>
      <dl className="p-3 bg-zinc-50 rounded-md border border-zinc-200 inline-grid grid-cols-[auto_auto] gap-x-3 gap-y-1 text-left text-xs">
        <dt className="text-zinc-500">Original bill</dt>
        <dd className="font-mono font-semibold">{returnRecord.originalInvoiceNumber || originalInvoiceNumber}</dd>
        <dt className="text-zinc-500">Refund amount</dt>
        <dd className="font-mono font-bold">{formatInr(Number(returnRecord.totalRefundAmount || 0))}</dd>
        <dt className="text-zinc-500">Refund method</dt>
        <dd className="font-semibold">{REFUND_MODE_LABELS[returnRecord.refundMode] ?? returnRecord.refundMode}</dd>
      </dl>
    </div>
  );
}

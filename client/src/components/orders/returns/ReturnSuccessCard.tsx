import { CheckCircle } from '@phosphor-icons/react';
import type { OrderReturnRecord } from '../../../types/shift-return.types';

interface ReturnSuccessCardProps {
  returnRecord: OrderReturnRecord;
  originalInvoiceNumber?: string;
}

export function ReturnSuccessCard({ returnRecord, originalInvoiceNumber }: ReturnSuccessCardProps) {
  return (
    <div className="py-8 text-center space-y-3">
      <CheckCircle weight="fill" className="w-14 h-14 text-emerald-500 mx-auto" />
      <h4 className="font-bold text-base text-zinc-900">Return Processed Successfully</h4>
      <p className="text-xs text-zinc-600">
        Return Voucher Reference:{' '}
        <span className="font-mono font-bold text-red-600">{returnRecord.returnNumber}</span>
      </p>
      <div className="p-3 bg-zinc-50 rounded-md border border-zinc-200 inline-block text-left text-xs space-y-1">
        <div>
          Original Bill:{' '}
          <span className="font-mono font-semibold">{returnRecord.originalInvoiceNumber || originalInvoiceNumber}</span>
        </div>
        <div>
          Refund Amount:{' '}
          <span className="font-mono font-bold text-red-600">
            ₹{Number(returnRecord.totalRefundAmount || 0).toFixed(2)}
          </span>
        </div>
        <div>
          Refund Tender: <span className="font-semibold">{returnRecord.refundMode}</span>
        </div>
      </div>
    </div>
  );
}

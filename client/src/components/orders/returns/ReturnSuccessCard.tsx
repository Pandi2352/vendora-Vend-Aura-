import { CheckCircle } from '@phosphor-icons/react';
import type { OrderItemRecord } from '../../../types/pos.types';

interface ReturnSuccessCardProps {
  successReturnNumber: string;
  foundOrder: OrderItemRecord | null;
  totalRefundAmount: number;
  refundMode: string;
}

export function ReturnSuccessCard({
  successReturnNumber,
  foundOrder,
  totalRefundAmount,
  refundMode,
}: ReturnSuccessCardProps) {
  return (
    <div className="py-8 text-center space-y-3">
      <CheckCircle weight="fill" className="w-14 h-14 text-emerald-500 mx-auto" />
      <h4 className="font-bold text-base text-zinc-900">Return Processed Successfully</h4>
      <p className="text-xs text-zinc-600">
        Return Voucher Reference: <span className="font-mono font-bold text-red-600">{successReturnNumber}</span>
      </p>
      <div className="p-3 bg-zinc-50 rounded-md border border-zinc-200 inline-block text-left text-xs space-y-1">
        <div>Original Bill: <span className="font-mono font-semibold">{foundOrder?.invoiceNumber}</span></div>
        <div>Refund Amount: <span className="font-mono font-bold text-red-600">₹{totalRefundAmount}</span></div>
        <div>Refund Tender: <span className="font-semibold">{refundMode}</span></div>
      </div>
    </div>
  );
}


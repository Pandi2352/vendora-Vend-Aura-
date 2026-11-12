import { useState, useEffect } from 'react';
import { X, Receipt, CheckCircle, Printer } from '@phosphor-icons/react';
import { api } from '../../lib/api';
import { formatDate } from '@/utils';
import { Spinner } from '../../components/ui/Spinner';

interface SubscriptionInvoiceItem {
  _id: string;
  invoiceNumber: string;
  planCode: string;
  billingCycle: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  paidAt: string;
}

interface SubscriptionInvoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopName?: string;
}

export function SubscriptionInvoicesModal({ isOpen, onClose, shopName }: SubscriptionInvoicesModalProps) {
  const [invoices, setInvoices] = useState<SubscriptionInvoiceItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api.get('/payments/invoices')
      .then((res) => setInvoices(res.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = (inv: SubscriptionInvoiceItem) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Vendora Tax Invoice - ${inv.invoiceNumber}</title>
          <style>
            body { font-family: monospace; padding: 24px; color: #111; }
            .header { border-bottom: 2px dashed #999; padding-bottom: 12px; margin-bottom: 12px; text-align: center; }
            .row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; }
            .total { font-weight: bold; font-size: 16px; border-top: 1px solid #111; padding-top: 8px; margin-top: 8px; }
            .badge { background: #e6f4ea; color: #137333; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="margin:0;">VENDORA RETAILPOS SAAS</h2>
            <p style="margin:4px 0 0; font-size:11px; color:#555;">Official Subscription Tax Receipt</p>
          </div>
          <div class="row"><span>Invoice #:</span><strong>${inv.invoiceNumber}</strong></div>
          <div class="row"><span>Customer Store:</span><span>${shopName || 'Store Account'}</span></div>
          <div class="row"><span>Date:</span><span>${formatDate(inv.paidAt)}</span></div>
          <div class="row"><span>Plan Tier:</span><strong>${inv.planCode} (${inv.billingCycle})</strong></div>
          <div class="row"><span>Payment Provider:</span><span>${inv.paymentMethod}</span></div>
          <div class="row"><span>Status:</span><span class="badge">PAID</span></div>
          <div class="row total"><span>Total Amount Paid:</span><span>₹${inv.amount.toLocaleString('en-IN')}.00</span></div>
          <p style="text-align:center; font-size:10px; color:#777; margin-top:24px;">Thank you for your business! Vendora Cloud POS.</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-md max-w-lg w-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Receipt weight="bold" className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-950">Subscription Billing History</h3>
              <p className="text-[11px] text-zinc-500">Official tax receipts for your store SaaS plan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto text-xs space-y-2.5">
          {loading ? (
            <div className="py-8 text-center text-zinc-500 flex items-center justify-center gap-2">
              <Spinner size="sm" />
              <span>Loading payment history...</span>
            </div>
          ) : invoices.length === 0 ? (
            <div className="py-8 text-center text-zinc-400">
              No previous paid invoices recorded. Future Stripe payments will generate receipts here.
            </div>
          ) : (
            invoices.map((inv) => (
              <div
                key={inv._id}
                className="p-3 rounded-md bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-zinc-950">{inv.invoiceNumber}</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold inline-flex items-center gap-0.5">
                      <CheckCircle weight="fill" className="w-3 h-3 text-emerald-600" /> PAID
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {inv.planCode} Plan ({inv.billingCycle}) · {formatDate(inv.paidAt)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-sm text-zinc-950">
                    ₹{inv.amount.toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => handlePrint(inv)}
                    title="Print Receipt"
                    className="p-1.5 rounded border border-zinc-300 hover:bg-zinc-200 text-zinc-700 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-semibold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


import { Printer, CheckCircle, X, Usb } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import type { InvoiceData } from '../types/pos.types';
import { usePreferences } from '../hooks/usePreferences';
import { BarcodeSvg } from './common/BarcodeSvg';
import { generateEscposBuffer, printToSerialThermalPrinter } from '../lib/escpos';

interface ThermalReceiptModalProps {
  invoice: InvoiceData | null;
  onClose: () => void;
  onNewSale: () => void;
}

export function ThermalReceiptModal({ invoice, ...rest }: ThermalReceiptModalProps) {
  if (!invoice) return null;
  // Keyed by invoice so auto-print fires once per new bill.
  return <ThermalReceipt key={invoice.invoiceNumber} invoice={invoice} {...rest} />;
}

function ThermalReceipt({
  invoice,
  onClose,
  onNewSale,
}: Omit<ThermalReceiptModalProps, 'invoice'> & { invoice: InvoiceData }) {
  const { receiptWidth: defaultWidth, autoPrintReceipt } = usePreferences();
  const [rollWidth, setRollWidth] = useState<'80mm' | '58mm'>(defaultWidth || '80mm');
  const [escposStatus, setEscposStatus] = useState('');

  const handlePrint = () => {
    window.print();
  };

  const handleRawEscposPrint = async () => {
    setEscposStatus('Connecting to thermal printer…');
    const buffer = generateEscposBuffer(invoice, { rollWidth });
    const success = await printToSerialThermalPrinter(buffer);
    if (success) {
      setEscposStatus('Receipt sent to thermal printer!');
      setTimeout(() => setEscposStatus(''), 3000);
    } else {
      // Fallback: download the raw .prn file for USB spooler
      const blob = new Blob([buffer as unknown as BlobPart], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoiceNumber}.prn`;
      a.click();
      URL.revokeObjectURL(url);
      setEscposStatus('ESC/POS raw binary saved for printer spooler');
      setTimeout(() => setEscposStatus(''), 4000);
    }
  };

  useEffect(() => {
    if (!autoPrintReceipt) return;
    const timer = window.setTimeout(() => window.print(), 150);
    return () => window.clearTimeout(timer);
  }, [autoPrintReceipt]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-sans">
      <div className={`bg-white rounded-md border border-zinc-300 w-full ${rollWidth === '58mm' ? 'max-w-[17.5rem]' : 'max-w-sm'} overflow-hidden shadow-2xl`}>
        {/* Receipt Header Actions */}
        <div className="p-3 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
            <CheckCircle weight="bold" className="w-4 h-4 text-emerald-600" />
            <span>Bill Generated</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded border border-zinc-300 bg-zinc-100 p-0.5 text-[0.625rem] font-bold">
              <button
                type="button"
                onClick={() => setRollWidth('80mm')}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${rollWidth === '80mm' ? 'bg-white shadow text-zinc-900' : 'text-zinc-500'}`}
              >
                80mm
              </button>
              <button
                type="button"
                onClick={() => setRollWidth('58mm')}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${rollWidth === '58mm' ? 'bg-white shadow text-zinc-900' : 'text-zinc-500'}`}
              >
                58mm
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-md bg-zinc-200 hover:bg-zinc-300 text-zinc-700 flex items-center justify-center cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {escposStatus && (
          <div className="p-2 bg-blue-50 border-b border-blue-200 text-blue-700 text-[0.6875rem] text-center print:hidden">
            {escposStatus}
          </div>
        )}

        {/* Thermal receipt preview */}
        <div className="p-6 font-mono text-zinc-950 text-xs bg-white space-y-3 leading-tight select-text max-h-[70vh] overflow-y-auto">
          {/* Store Info */}
          <div className="text-center space-y-1">
            {invoice.isOffline && (
              <div className="p-1 mb-1 rounded bg-amber-50 border border-amber-300 text-center text-[0.625rem] font-bold text-amber-900 tracking-wide uppercase">
                *** OFFLINE TILL SALE (QUEUED) ***
              </div>
            )}
            <h2 className="font-bold text-base uppercase tracking-tight">{invoice.shopName}</h2>
            {invoice.address && <p className="text-[0.6875rem] text-zinc-600">{invoice.address}</p>}
            {invoice.phone && <p className="text-[0.6875rem] text-zinc-600">Ph: {invoice.phone}</p>}
            {invoice.gstin && <p className="text-[0.6875rem] text-zinc-600">GSTIN: {invoice.gstin}</p>}
            <p className="text-[0.625rem] text-zinc-500">
              {invoice.terminal ? `Terminal: ${invoice.terminal} • ` : ''}Cashier: {invoice.cashier}
            </p>
          </div>

          <div className="border-t border-dashed border-zinc-400 my-2" />

          {/* Invoice Meta */}
          <div className="flex justify-between text-[0.6875rem] text-zinc-700">
            <span>Bill: {invoice.invoiceNumber}</span>
            <span>Date: {invoice.date}</span>
          </div>
          <div className="flex justify-between text-[0.6875rem] text-zinc-700">
            <span>Time: {invoice.time}</span>
            <span>Tender: {invoice.paymentMode}</span>
          </div>
          {invoice.customerName && (
            <div className="text-[0.6875rem] text-zinc-700">
              <span>Customer: {invoice.customerName}</span>
              {invoice.customerPhone && <span> ({invoice.customerPhone})</span>}
            </div>
          )}

          <div className="border-t border-dashed border-zinc-400 my-2" />

          {/* Items Header */}
          <div className="grid grid-cols-12 font-bold text-[0.6875rem] border-b border-zinc-400 pb-1">
            <span className="col-span-6">Item</span>
            <span className="col-span-2 text-center">Qty</span>
            <span className="col-span-2 text-right">Rate</span>
            <span className="col-span-2 text-right">Amt</span>
          </div>

          {/* Items List */}
          <div className="space-y-1.5 pt-1">
            {invoice.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 text-[0.6875rem]">
                <span className="col-span-6 truncate font-medium">{item.name}</span>
                <span className="col-span-2 text-center">{item.quantity}</span>
                <span className="col-span-2 text-right">{(item.unitPrice).toFixed(2)}</span>
                <span className="col-span-2 text-right font-bold">
                  {(item.quantity * item.unitPrice).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-zinc-400 my-2" />

          {/* Summary Totals */}
          <div className="space-y-1 text-[0.6875rem]">
            <div className="flex justify-between">
              <span>Subtotal (Net):</span>
              <span>₹{invoice.subTotal.toFixed(2)}</span>
            </div>
            {invoice.discountAmount && invoice.discountAmount > 0 ? (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Promo Discount ({invoice.couponCode || 'OFFER'}):</span>
                <span>-₹{invoice.discountAmount.toFixed(2)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-zinc-600">
              <span>CGST:</span>
              <span>₹{(invoice.cgst).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>SGST:</span>
              <span>₹{(invoice.sgst).toFixed(2)}</span>
            </div>
            {invoice.roundOff !== 0 && (
              <div className="flex justify-between text-zinc-600">
                <span>Round Off:</span>
                <span>{invoice.roundOff > 0 ? '+' : '-'}₹{Math.abs(invoice.roundOff).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm pt-1 border-t border-zinc-400">
              <span>NET PAYABLE:</span>
              <span>₹{invoice.grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-zinc-400 my-2" />

          {/* Payment breakdown */}
          <div className="space-y-1 text-[0.6875rem] text-zinc-700">
            <div className="flex justify-between">
              <span>Tender Received ({invoice.paymentMode}):</span>
              <span>₹{(invoice.cashTendered).toFixed(2)}</span>
            </div>
            {invoice.changeDue > 0 && (
              <div className="flex justify-between font-bold">
                <span>Change Returned:</span>
                <span>₹{(invoice.changeDue).toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Real Code128 Scannable Barcode & Footer */}
          <div className="pt-3 text-center space-y-1.5 flex flex-col items-center">
            <div className="w-full max-w-[200px] flex justify-center text-zinc-900">
              <BarcodeSvg text={invoice.invoiceNumber} height={36} />
            </div>
            <span className="text-[0.625rem] font-mono tracking-wider">{invoice.invoiceNumber}</span>
            <p className="text-[0.625rem] text-zinc-500 font-sans">
              Thank you for shopping with us!
            </p>
            <p className="text-[0.5625rem] text-zinc-400 font-sans">
              Powered by Vendora Cloud RetailPOS
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between print:hidden">
          <button
            onClick={onNewSale}
            className="px-3 py-1.5 rounded-md bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-semibold cursor-pointer"
          >
            New Sale
          </button>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRawEscposPrint}
              className="px-2.5 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Print via USB Serial ESC/POS"
            >
              <Usb weight="bold" className="w-3.5 h-3.5 text-zinc-600" />
              <span>ESC/POS</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-md bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer weight="bold" className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

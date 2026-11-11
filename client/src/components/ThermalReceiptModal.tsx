import { Printer, CheckCircle, X, Barcode } from '@phosphor-icons/react';
import type { InvoiceData } from '../types/pos.types';

interface ThermalReceiptModalProps {
  invoice: InvoiceData | null;
  onClose: () => void;
  onNewSale: () => void;
}

export function ThermalReceiptModal({
  invoice,
  onClose,
  onNewSale,
}: ThermalReceiptModalProps) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xs">
      <div className="bg-white rounded-md border border-zinc-300 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Receipt Header Actions */}
        <div className="p-3 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
            <CheckCircle weight="bold" className="w-4 h-4 text-emerald-600" />
            <span>Bill Generated Successfully</span>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-md bg-zinc-200 hover:bg-zinc-300 text-zinc-700 flex items-center justify-center cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 80mm Thermal Receipt Simulation */}
        <div className="p-6 font-mono text-zinc-950 text-xs bg-white space-y-3 leading-tight select-text max-h-[70vh] overflow-y-auto">
          {/* Store Info */}
          <div className="text-center space-y-1">
            <h2 className="font-bold text-base uppercase tracking-tight">{invoice.shopName}</h2>
            {invoice.address && <p className="text-[11px] text-zinc-600">{invoice.address}</p>}
            {invoice.phone && <p className="text-[11px] text-zinc-600">Ph: {invoice.phone}</p>}
            {invoice.gstin && <p className="text-[11px] text-zinc-600">GSTIN: {invoice.gstin}</p>}
            <p className="text-[10px] text-zinc-500">
              {invoice.terminal ? `Terminal: ${invoice.terminal} • ` : ''}Cashier: {invoice.cashier}
            </p>
          </div>

          <div className="border-t border-dashed border-zinc-400 my-2" />

          {/* Invoice Meta */}
          <div className="flex justify-between text-[11px] text-zinc-700">
            <span>Bill: {invoice.invoiceNumber}</span>
            <span>{invoice.date} {invoice.time}</span>
          </div>

          {invoice.customerName && (
            <div className="text-[11px] text-zinc-800 flex justify-between font-bold mt-1">
              <span>Customer: {invoice.customerName}</span>
              {invoice.customerPhone && <span className="font-mono">{invoice.customerPhone}</span>}
            </div>
          )}

          <div className="border-t border-dashed border-zinc-400 my-2" />

          {/* Items Header */}
          <div className="flex justify-between font-bold text-[11px] pb-1 border-b border-zinc-300">
            <span className="w-1/2">ITEM</span>
            <span className="w-1/6 text-center">QTY</span>
            <span className="w-1/6 text-right">RATE</span>
            <span className="w-1/6 text-right">TOTAL</span>
          </div>

          {/* Items List */}
          <div className="space-y-1.5 text-[11px]">
            {invoice.items.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex justify-between">
                <span className="w-1/2 truncate font-medium">{item.name}</span>
                <span className="w-1/6 text-center">{item.quantity}</span>
                <span className="w-1/6 text-right">₹{item.unitPrice}</span>
                <span className="w-1/6 text-right font-bold">₹{(item.unitPrice * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-zinc-400 my-2" />

          {/* Taxes & Totals */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal (Net):</span>
              <span>₹{invoice.subTotal.toFixed(2)}</span>
            </div>
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

          {/* Payment Mode details */}
          <div className="text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span>Mode:</span>
              <span className="font-bold">{invoice.paymentMode}</span>
            </div>
            {invoice.paymentMode === 'CASH' && (
              <>
                <div className="flex justify-between text-zinc-600">
                  <span>Cash Tendered:</span>
                  <span>₹{invoice.cashTendered}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Change Due:</span>
                  <span>₹{invoice.changeDue.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {/* Barcode & Footer */}
          <div className="pt-3 text-center space-y-1">
            <div className="flex justify-center text-zinc-800">
              <Barcode className="w-32 h-10" />
            </div>
            <p className="text-[10px] text-zinc-500 font-sans">
              Thank you for shopping with us!
            </p>
            <p className="text-[9px] text-zinc-400 font-sans">
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
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 rounded-md bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer weight="bold" className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}


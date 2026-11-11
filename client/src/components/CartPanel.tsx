import { ShoppingCart, Plus, Minus, Trash, ArrowRight, PauseCircle, ClockCounterClockwise } from '@phosphor-icons/react';
import type { CartItem } from '../types/pos.types';

interface CartPanelProps {
  cart: CartItem[];
  subTotal: number;
  taxTotal: number;
  roundOff: number;
  grandTotal: number;
  isShiftOpen: boolean;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onProceedCheckout: () => void;
  onHoldCart?: () => void;
  heldCartsCount?: number;
  onOpenHeldCarts?: () => void;
}

export function CartPanel({
  cart,
  subTotal,
  taxTotal,
  roundOff,
  grandTotal,
  isShiftOpen,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedCheckout,
  onHoldCart,
  heldCartsCount = 0,
  onOpenHeldCarts,
}: CartPanelProps) {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <aside className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-zinc-200 flex flex-col shrink-0">
      {/* Cart Header */}
      <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart weight="bold" className="w-4 h-4 text-primary-600" />
          <h3 className="font-bold text-sm text-zinc-950">Current Register Bill</h3>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-zinc-100 text-zinc-700 font-bold">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {heldCartsCount > 0 && onOpenHeldCarts && (
            <button
              onClick={onOpenHeldCarts}
              className="text-[11px] text-red-600 hover:text-red-700 font-bold cursor-pointer flex items-center gap-1"
            >
              <ClockCounterClockwise className="w-3.5 h-3.5" />
              <span>Held ({heldCartsCount})</span>
            </button>
          )}

          {cart.length > 0 && (
            <button
              onClick={onClearCart}
              className="text-[11px] text-zinc-400 hover:text-red-600 font-semibold cursor-pointer transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {cart.length > 0 ? (
          cart.map((item) => {
            const lineTotal = item.unitPrice * item.quantity;
            return (
              <div
                key={item.id}
                className="p-2.5 rounded-md bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-xs text-zinc-950 truncate leading-tight">
                    {item.name}
                  </h5>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-0.5">
                    <span>₹{item.unitPrice} each</span>
                    <span>•</span>
                    <span>GST {item.taxRatePercent}%</span>
                  </div>
                </div>

                {/* Qty Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    className="w-5 h-5 rounded-md bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-700 flex items-center justify-center cursor-pointer text-xs"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <span className="font-mono font-bold text-xs w-6 text-center text-zinc-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    className="w-5 h-5 rounded-md bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-700 flex items-center justify-center cursor-pointer text-xs"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>

                {/* Line Total & Delete */}
                <div className="text-right shrink-0 min-w-[50px]">
                  <span className="font-mono font-bold text-xs text-zinc-950 block">
                    ₹{lineTotal.toFixed(2)}
                  </span>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-zinc-400 hover:text-red-600 cursor-pointer p-0.5 inline-block"
                  >
                    <Trash className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 py-12">
            <ShoppingCart className="w-10 h-10 text-zinc-300 mb-2" />
            <p className="text-xs font-semibold text-zinc-600">Register is empty</p>
            <p className="text-[11px] text-zinc-400 max-w-[200px] mt-0.5">
              Click items from the product grid or scan barcodes to begin billing.
            </p>
          </div>
        )}
      </div>

      {/* Bill Totals Summary */}
      <div className="p-4 border-t border-zinc-200 bg-zinc-50 space-y-2">
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-zinc-600">
            <span>Subtotal (Taxable):</span>
            <span className="font-mono font-medium">₹{subTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-zinc-600">
            <span>GST Tax (CGST + SGST):</span>
            <span className="font-mono font-medium text-emerald-600">+₹{taxTotal.toFixed(2)}</span>
          </div>
          {roundOff !== 0 && (
            <div className="flex justify-between text-zinc-500">
              <span>Round Off:</span>
              <span className="font-mono font-medium">
                {roundOff > 0 ? '+' : '-'}₹{Math.abs(roundOff).toFixed(2)}
              </span>
            </div>
          )}
          <div className="pt-2 border-t border-zinc-200 flex justify-between items-baseline">
            <span className="font-bold text-sm text-zinc-950">Grand Total:</span>
            <span className="font-mono font-black text-xl text-red-600">
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {!isShiftOpen && cart.length > 0 && (
          <div className="p-2 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
            Cash drawer is closed. Open a shift from the header before completing this bill.
          </div>
        )}

        {/* Action Buttons: Hold Cart + Checkout */}
        <div className="flex gap-2 pt-1">
          {onHoldCart && cart.length > 0 && (
            <button
              onClick={onHoldCart}
              className="py-2.5 px-3 rounded-md border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Park cart to serve next customer"
            >
              <PauseCircle weight="bold" className="w-4 h-4 text-amber-600" />
              <span>Hold</span>
            </button>
          )}

          <button
            onClick={onProceedCheckout}
            disabled={cart.length === 0}
            className="flex-1 py-2.5 rounded-md bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Tender & Complete Bill</span>
            <ArrowRight weight="bold" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

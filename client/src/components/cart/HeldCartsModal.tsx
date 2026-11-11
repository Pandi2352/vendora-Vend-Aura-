import { X, Play, Trash, PauseCircle, Clock } from '@phosphor-icons/react';
import type { HeldCart } from '../../types/shift-return.types';

interface HeldCartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  heldCarts: HeldCart[];
  onResumeCart: (cart: HeldCart) => void;
  onDiscardCart: (cartId: string) => void;
}

export function HeldCartsModal({
  isOpen,
  onClose,
  heldCarts,
  onResumeCart,
  onDiscardCart,
}: HeldCartsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-md max-w-lg w-full flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PauseCircle weight="bold" className="w-5 h-5 text-primary-600" />
            <div>
              <h3 className="font-bold text-sm text-zinc-950">Parked / Held Register Bills</h3>
              <p className="text-[11px] text-zinc-500">
                {heldCarts.length} {heldCarts.length === 1 ? 'bill' : 'bills'} currently paused
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {heldCarts.length === 0 ? (
            <div className="py-12 text-center text-zinc-400">
              <PauseCircle className="w-12 h-12 text-zinc-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-zinc-700">No Held Bills</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Use the "Hold" button on the register when a customer steps aside.
              </p>
            </div>
          ) : (
            heldCarts.map((hc, idx) => (
              <div
                key={hc.id}
                className="p-3.5 rounded-md border border-zinc-200 bg-zinc-50 flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-zinc-900">
                      Cart #{idx + 1}
                    </span>
                    {hc.customerName && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-700 font-semibold rounded-md border border-red-200">
                        {hc.customerName}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-zinc-600 truncate mt-1">
                    {hc.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-mono mt-1.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(hc.heldAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>•</span>
                    <span>{hc.items.reduce((s, i) => s + i.quantity, 0)} items</span>
                    <span>•</span>
                    <span className="font-bold text-zinc-900">₹{hc.grandTotal}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onResumeCart(hc)}
                    className="px-2.5 py-1.5 rounded-md bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Play weight="fill" className="w-3 h-3" />
                    <span>Resume</span>
                  </button>
                  <button
                    onClick={() => onDiscardCart(hc.id)}
                    className="p-1.5 rounded-md border border-zinc-300 hover:bg-red-50 hover:text-red-600 text-zinc-500 cursor-pointer transition-colors"
                    title="Discard held cart"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


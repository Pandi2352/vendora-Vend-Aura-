import { MagnifyingGlass, Barcode, Plus, Tag } from '@phosphor-icons/react';
import type { ProductItem } from '../types/pos.types';

interface ProductGridProps {
  products: ProductItem[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAddToCart: (product: ProductItem) => void;
}

export function ProductGrid({
  products,
  searchQuery,
  onSearchChange,
  onAddToCart,
}: ProductGridProps) {
  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden">
      {/* Search Bar with F1 Hotkey Binding */}
      <div className="mb-3 relative">
        <MagnifyingGlass className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
        <input
          id="pos-product-search"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search products"
          placeholder="Scan barcode or type product name / SKU (e.g. Atta, Tea, 890103...)"
          className="w-full pl-9 pr-24 py-2 rounded-md border border-zinc-300 bg-white text-xs sm:text-sm text-zinc-950 focus:border-primary-600 outline-none"
        />
        <div className="absolute right-3 top-2 flex items-center gap-1 text-[0.6875rem] font-mono text-zinc-400">
          <Barcode className="w-3.5 h-3.5" />
          <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-600 font-semibold text-[0.625rem]">
            F1 Focus
          </kbd>
        </div>
      </div>

      {/* Grid of Product Cards */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {products.map((p) => (
            // Whole-card click is a pointer shortcut; the "Add" button inside is the keyboard/AT equivalent.
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
            <div
              key={p.id}
              onClick={() => onAddToCart(p)}
              className="bg-white p-3.5 rounded-md border border-zinc-200 hover:border-red-500 transition-all cursor-pointer flex flex-col justify-between group select-none"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[0.625rem] font-semibold px-1.5 py-0.2 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200 truncate">
                    {p.category}
                  </span>
                  <span className="text-[0.625rem] font-mono text-zinc-400 flex items-center gap-0.5">
                    <Barcode className="w-3 h-3" />
                    <span>{p.barcode}</span>
                  </span>
                </div>

                <h4 className="font-bold text-xs sm:text-sm text-zinc-950 line-clamp-2 leading-tight group-hover:text-red-600 transition-colors">
                  {p.name}
                </h4>

                {(p.batchNumber || p.expiryDate) && (
                  <div className="flex items-center gap-1.5 mt-1 text-[0.625rem] text-zinc-500 font-mono">
                    {p.batchNumber && <span className="bg-zinc-100 px-1 rounded">B:{p.batchNumber}</span>}
                    {p.expiryDate && <span className="text-amber-700">Exp:{p.expiryDate}</span>}
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-end justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono font-black text-sm sm:text-base text-zinc-950">
                      ₹{p.unitPrice}
                    </span>
                    {p.mrp > p.unitPrice && (
                      <span className="text-[0.6875rem] font-mono text-zinc-400 line-through">
                        ₹{p.mrp}
                      </span>
                    )}
                  </div>
                  <span className="text-[0.625rem] text-zinc-400 font-medium block">
                    GST {p.taxRatePercent}%
                  </span>
                </div>

                <button
                  type="button"
                  aria-label={`Add ${p.name} to cart`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(p);
                  }}
                  className="w-7 h-7 rounded-md bg-zinc-100 group-hover:bg-primary-600 text-zinc-700 group-hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Plus weight="bold" className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <div className="col-span-full py-12 text-center text-zinc-500 text-xs">
              <Tag className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
              <p className="font-semibold text-zinc-700">No items match your search.</p>
              <p className="text-zinc-400 text-[0.6875rem] mt-0.5">Try searching with a different keyword or barcode.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

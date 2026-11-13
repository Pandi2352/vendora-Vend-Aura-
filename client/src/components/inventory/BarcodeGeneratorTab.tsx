import { useState, useEffect } from 'react';
import { api, unwrap, getErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui';
import {
  Barcode as BarcodeIcon,
  Printer,
  SlidersHorizontal,
  WarningCircle,
} from '@phosphor-icons/react';
import { BarcodeSvg } from '@/components/common/BarcodeSvg';

interface ProductItem {
  id: string;
  name: string;
  barcode: string;
  category: string;
  unitPrice: number;
}

type SheetLayout = '24_A4' | '40_A4' | 'ROLL_50X25';

export function BarcodeGeneratorTab() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('ALL');
  const [stickersPerItem, setStickersPerItem] = useState<number>(4);
  const [layout, setLayout] = useState<SheetLayout>('24_A4');
  const [showStoreName, setShowStoreName] = useState(true);
  const [showProductName, setShowProductName] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    api
      .get('/products', { params: { limit: 100 } })
      .then((res) => {
        const data = unwrap<ProductItem[]>(res) || [];
        setProducts(data);
      })
      .catch((err) => setError(getErrorMessage(err, 'Failed to fetch catalog products')))
      .finally(() => setIsLoading(false));
  }, []);

  const printableItems: ProductItem[] =
    selectedProductId === 'ALL'
      ? products
      : products.filter((p) => p.id === selectedProductId);

  // Flatten into individual stickers based on stickersPerItem
  const stickerList: ProductItem[] = [];
  printableItems.forEach((p) => {
    for (let i = 0; i < stickersPerItem; i++) {
      stickerList.push(p);
    }
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Configuration Toolbar */}
      <div className="bg-white p-4 rounded-md border border-zinc-200 shadow-sm print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <BarcodeIcon weight="bold" className="w-5 h-5 text-primary-600" />
            <div>
              <h3 className="font-bold text-sm text-zinc-950">Barcode Label & Sticker Sheet Generator</h3>
              <p className="text-[0.6875rem] text-zinc-500">
                Generate standard Code128 barcodes formatted for laser sticker sheets or thermal roll printers
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={handlePrint}
            disabled={stickerList.length === 0}
            icon={<Printer weight="bold" className="w-4 h-4" />}
          >
            Print Sticker Sheet ({stickerList.length} Labels)
          </Button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <WarningCircle weight="bold" className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3">
          <div>
            <label htmlFor="barcode-product-select" className="text-xs font-bold text-zinc-700 block mb-1">
              Select Product *
            </label>
            <select
              id="barcode-product-select"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              disabled={isLoading}
              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-zinc-300 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium text-zinc-900"
            >
              <option value="ALL">All Products in Catalog ({products.length})</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.barcode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="stickers-per-item-input" className="text-xs font-bold text-zinc-700 block mb-1">
              Stickers Per Item
            </label>
            <input
              id="stickers-per-item-input"
              type="number"
              min="1"
              max="50"
              value={stickersPerItem}
              onChange={(e) => setStickersPerItem(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-zinc-300 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="sheet-layout-select" className="text-xs font-bold text-zinc-700 block mb-1">
              Sticker Sheet Format
            </label>
            <select
              id="sheet-layout-select"
              value={layout}
              onChange={(e) => setLayout(e.target.value as SheetLayout)}
              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-zinc-300 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium text-zinc-900"
            >
              <option value="24_A4">24 Labels / A4 Sheet (3 × 8 grid)</option>
              <option value="40_A4">40 Labels / A4 Sheet (4 × 10 grid)</option>
              <option value="ROLL_50X25">Thermal Roll (50mm × 25mm)</option>
            </select>
          </div>

          <div>
            <span className="text-xs font-bold text-zinc-700 block mb-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Label Contents
            </span>
            <div className="flex items-center gap-3 pt-1 text-xs">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showStoreName}
                  onChange={(e) => setShowStoreName(e.target.checked)}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span>Store</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showProductName}
                  onChange={(e) => setShowProductName(e.target.checked)}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span>Name</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPrice}
                  onChange={(e) => setShowPrice(e.target.checked)}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span>MRP</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Live Sticker Grid Preview */}
      <div className="bg-white p-4 rounded-md border border-zinc-200 shadow-sm">
        <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 print:hidden">
          Sticker Sheet Live Preview ({stickerList.length} stickers)
        </div>

        <div
          className={`grid gap-2 print:gap-1 ${
            layout === '24_A4'
              ? 'grid-cols-2 sm:grid-cols-3 print:grid-cols-3'
              : layout === '40_A4'
              ? 'grid-cols-2 sm:grid-cols-4 print:grid-cols-4'
              : 'grid-cols-2 sm:grid-cols-4 print:grid-cols-1'
          }`}
        >
          {stickerList.map((item, index) => (
            <div
              key={index}
              className="p-2.5 rounded-md border border-zinc-300 print:border-zinc-400 bg-white flex flex-col items-center justify-between text-center overflow-hidden h-28"
            >
              {showStoreName && (
                <div className="text-[0.5625rem] font-bold text-zinc-500 uppercase tracking-wider truncate w-full">
                  Vendora Retail Store
                </div>
              )}
              {showProductName && (
                <div className="text-xs font-black text-zinc-950 truncate w-full px-1">
                  {item.name}
                </div>
              )}
              <div className="w-full flex justify-center py-0.5">
                <BarcodeSvg text={item.barcode} height={32} className="text-zinc-950" />
              </div>
              <div className="flex items-center justify-between w-full px-1 text-[0.625rem] font-mono text-zinc-700">
                <span className="truncate">{item.barcode}</span>
                {showPrice && (
                  <span className="font-bold text-zinc-950 text-xs">
                    ₹{item.unitPrice}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

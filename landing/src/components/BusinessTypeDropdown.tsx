import { useState, useRef, useEffect } from 'react';
import { CaretDown, CaretUp } from '@phosphor-icons/react';
import { BusinessType } from '../shared';
import {
  IconTextile,
  IconFruits,
  IconGrocery,
  IconSupermarket,
  IconBakery,
  IconRestaurant,
  IconPharmacy,
  IconFootwear,
  IconElectronics,
  IconStationery,
  IconHardware,
  IconCosmetics,
  IconJewellery,
  IconCrackers,
  IconOthers,
} from './BusinessTypeIcons';

export interface BusinessTypeOption {
  value: BusinessType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const BUSINESS_TYPE_OPTIONS: BusinessTypeOption[] = [
  { value: BusinessType.TEXTILE_GARMENTS, label: 'Textile & Garments', icon: IconTextile },
  { value: BusinessType.FRUITS_VEGETABLES, label: 'Fruits & Vegetables', icon: IconFruits },
  { value: BusinessType.GROCERY, label: 'Grocery / Kirana', icon: IconGrocery },
  { value: BusinessType.SUPERMARKET, label: 'Supermarket', icon: IconSupermarket },
  { value: BusinessType.BAKERY_SWEETS, label: 'Bakery & Sweets', icon: IconBakery },
  { value: BusinessType.RESTAURANT_CAFE, label: 'Restaurant / Café', icon: IconRestaurant },
  { value: BusinessType.PHARMACY, label: 'Pharmacy / Medical', icon: IconPharmacy },
  { value: BusinessType.FOOTWEAR, label: 'Footwear', icon: IconFootwear },
  { value: BusinessType.ELECTRONICS_MOBILES, label: 'Electronics & Mobiles', icon: IconElectronics },
  { value: BusinessType.STATIONERY_BOOKS, label: 'Stationery & Books', icon: IconStationery },
  { value: BusinessType.HARDWARE_PAINTS, label: 'Hardware & Paints', icon: IconHardware },
  { value: BusinessType.COSMETICS_BEAUTY, label: 'Cosmetics & Beauty', icon: IconCosmetics },
  { value: BusinessType.JEWELLERY, label: 'Jewellery', icon: IconJewellery },
  { value: BusinessType.CRACKERS_FIREWORKS, label: 'Crackers / Fireworks', icon: IconCrackers },
  { value: BusinessType.OTHERS, label: 'Others', icon: IconOthers },
];

interface BusinessTypeDropdownProps {
  value: BusinessType;
  onChange: (val: BusinessType) => void;
  className?: string;
}

export function BusinessTypeDropdown({ value, onChange, className = '' }: BusinessTypeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = BUSINESS_TYPE_OPTIONS.find((opt) => opt.value === value) || BUSINESS_TYPE_OPTIONS[0];
  const SelectedIcon = selectedOption.icon;

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Trigger Button matching screenshot #3 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 rounded-md border text-left flex items-center justify-between text-sm font-medium transition-all cursor-pointer bg-white ${isOpen ? 'border-blue-500 ring-1 ring-blue-500 text-zinc-950' : 'border-zinc-300 hover:border-zinc-400 text-zinc-900'
          }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <SelectedIcon className="w-4 h-4 text-zinc-700 shrink-0" />
          <span className="truncate">{selectedOption.label}</span>
        </div>
        {isOpen ? (
          <CaretUp weight="bold" className="w-3.5 h-3.5 text-zinc-700 shrink-0" />
        ) : (
          <CaretDown weight="bold" className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        )}
      </button>

      {/* Dropdown Options List matching media_1794380035542_2fdcc0a3.png & media_1794380045992_7f6c4f2f.png */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md border border-zinc-300 py-1.5 z-50 max-h-60 overflow-y-auto">
          {BUSINESS_TYPE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 text-sm flex items-center gap-2.5 cursor-pointer transition-colors ${isSelected
                    ? 'bg-blue-50 text-blue-900 font-semibold'
                    : 'text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950'
                  }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-700' : 'text-zinc-600'}`} />
                <span className="truncate">{opt.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

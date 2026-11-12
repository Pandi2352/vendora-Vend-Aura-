import type { ComponentType } from 'react';
import { BusinessType, BUSINESS_TYPE_LABELS } from '../../shared';
import type { DropdownOption } from '../ui/dropdown';
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
} from '../BusinessTypeIcons';

const ICONS: Record<BusinessType, ComponentType<{ className?: string }>> = {
  [BusinessType.TEXTILE_GARMENTS]: IconTextile,
  [BusinessType.FRUITS_VEGETABLES]: IconFruits,
  [BusinessType.GROCERY]: IconGrocery,
  [BusinessType.SUPERMARKET]: IconSupermarket,
  [BusinessType.BAKERY_SWEETS]: IconBakery,
  [BusinessType.RESTAURANT_CAFE]: IconRestaurant,
  [BusinessType.PHARMACY]: IconPharmacy,
  [BusinessType.FOOTWEAR]: IconFootwear,
  [BusinessType.ELECTRONICS_MOBILES]: IconElectronics,
  [BusinessType.STATIONERY_BOOKS]: IconStationery,
  [BusinessType.HARDWARE_PAINTS]: IconHardware,
  [BusinessType.COSMETICS_BEAUTY]: IconCosmetics,
  [BusinessType.JEWELLERY]: IconJewellery,
  [BusinessType.CRACKERS_FIREWORKS]: IconCrackers,
  [BusinessType.OTHERS]: IconOthers,
  [BusinessType.GENERAL_RETAIL]: IconSupermarket,
};

/** Dropdown options in the order of BUSINESS_TYPE_LABELS (the shared source of truth). */
export const BUSINESS_TYPE_OPTIONS: DropdownOption<BusinessType>[] = (
  Object.keys(BUSINESS_TYPE_LABELS) as BusinessType[]
).map((value) => {
  const Icon = ICONS[value];
  return { value, label: BUSINESS_TYPE_LABELS[value], icon: <Icon className="w-4 h-4 text-zinc-600" /> };
});

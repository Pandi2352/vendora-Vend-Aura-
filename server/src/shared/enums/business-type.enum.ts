export enum BusinessType {
  GROCERY = 'GROCERY',
  SUPERMARKET = 'SUPERMARKET',
  TEXTILE_GARMENTS = 'TEXTILE_GARMENTS',
  FRUITS_VEGETABLES = 'FRUITS_VEGETABLES',
  BAKERY_SWEETS = 'BAKERY_SWEETS',
  RESTAURANT_CAFE = 'RESTAURANT_CAFE',
  PHARMACY = 'PHARMACY',
  FOOTWEAR = 'FOOTWEAR',
  ELECTRONICS_MOBILES = 'ELECTRONICS_MOBILES',
  STATIONERY_BOOKS = 'STATIONERY_BOOKS',
  HARDWARE_PAINTS = 'HARDWARE_PAINTS',
  COSMETICS_BEAUTY = 'COSMETICS_BEAUTY',
  JEWELLERY = 'JEWELLERY',
  GENERAL_RETAIL = 'GENERAL_RETAIL',
}

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  [BusinessType.GROCERY]: 'Grocery / Kirana',
  [BusinessType.SUPERMARKET]: 'Supermarket',
  [BusinessType.TEXTILE_GARMENTS]: 'Textile & Garments',
  [BusinessType.FRUITS_VEGETABLES]: 'Fruits & Vegetables',
  [BusinessType.BAKERY_SWEETS]: 'Bakery & Sweets',
  [BusinessType.RESTAURANT_CAFE]: 'Restaurant / Café',
  [BusinessType.PHARMACY]: 'Pharmacy / Medical',
  [BusinessType.FOOTWEAR]: 'Footwear',
  [BusinessType.ELECTRONICS_MOBILES]: 'Electronics & Mobiles',
  [BusinessType.STATIONERY_BOOKS]: 'Stationery & Books',
  [BusinessType.HARDWARE_PAINTS]: 'Hardware & Paints',
  [BusinessType.COSMETICS_BEAUTY]: 'Cosmetics & Beauty',
  [BusinessType.JEWELLERY]: 'Jewellery',
  [BusinessType.GENERAL_RETAIL]: 'General Retail',
};


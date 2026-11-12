import type { DropdownOption } from '@/components/ui/dropdown/dropdown-utils';
import type { RadioOption } from '@/components/ui/RadioGroup';
import type { CashRounding } from './companyProfile.schema';

const list = (values: string[]): DropdownOption[] => values.map((value) => ({ value, label: value }));

export const COUNTRY_OPTIONS: DropdownOption[] = [{ value: 'IN', label: 'India', description: 'INR · ₹' }];

export const STATE_OPTIONS = list([
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
]);

export const TAX_TAKEN_OPTIONS: DropdownOption[] = [
  { value: 'selling', label: 'On selling price' },
  { value: 'mrp', label: 'On MRP' },
  { value: 'cost', label: 'On cost price' },
];

export const CURRENCY_OPTIONS: DropdownOption[] = [
  { value: 'INR', label: 'INR', description: 'Indian rupee' },
  { value: 'USD', label: 'USD', description: 'US dollar' },
  { value: 'AED', label: 'AED', description: 'UAE dirham' },
  { value: 'LKR', label: 'LKR', description: 'Sri Lankan rupee' },
];

/** Sign printed on bills for each currency (filled in when the currency changes). */
export const CURRENCY_SIGNS: Record<string, string> = { INR: '₹', USD: '$', AED: 'AED', LKR: 'Rs' };

export const DATE_FORMAT_OPTIONS: DropdownOption[] = [
  { value: 'dd-MM-yyyy', label: 'dd-MM-yyyy', description: '31-12-2026' },
  { value: 'dd/MM/yyyy', label: 'dd/MM/yyyy', description: '31/12/2026' },
  { value: 'MM/dd/yyyy', label: 'MM/dd/yyyy', description: '12/31/2026' },
  { value: 'yyyy-MM-dd', label: 'yyyy-MM-dd', description: '2026-12-31' },
];

export const TIME_FORMAT_OPTIONS: DropdownOption[] = [
  { value: 'HH:mm', label: '24-hour', description: '14:30' },
  { value: 'hh:mm a', label: '12-hour', description: '02:30 PM' },
];

export const BILL_PRINT_OPTIONS: DropdownOption[] = [
  { value: 'thermal-80', label: 'Thermal 80 mm' },
  { value: 'thermal-58', label: 'Thermal 58 mm' },
  { value: 'a5', label: 'A5 invoice' },
  { value: 'a4', label: 'A4 invoice' },
];

export const COM_PORT_OPTIONS = list(Array.from({ length: 9 }, (_, i) => `COM${i + 1}`));

export const CASH_ROUNDING_OPTIONS: RadioOption<CashRounding>[] = [
  { value: 'none', label: 'None' },
  { value: '1', label: '₹1' },
  { value: '25', label: '25 p' },
  { value: '50', label: '50 p' },
  { value: '75', label: '75 p' },
];

import { z } from 'zod';
import { rules } from '@/validations/common';
import { dateRule, timeRule } from '@/validations/dates';

const percent = (label: string) => rules.number(label, { min: 0, max: 100 });
const optionalPercent = (label: string) => percent(label).optional();
const optionalCode = (label: string, max = 30) =>
  z.preprocess(
    (v) => (typeof v === 'string' ? v.trim().toUpperCase() || undefined : v),
    z.string().max(max, `${label} must be at most ${max} characters`).optional(),
  );

export const CASH_ROUNDING = ['none', '1', '25', '50', '75'] as const;
export type CashRounding = (typeof CASH_ROUNDING)[number];

/** Company profile on the Master page: identity, contact & tax, locale & bill, POS behaviour. */
export const companyProfileSchema = z.object({
  // Identity
  companyCode: rules.text('Company code', { max: 20 }),
  locationCode: rules.optionalText('Location code', { max: 20 }),
  companyName: rules.text('Company name', { max: 120 }),
  addressLine1: rules.text('Address line 1', { max: 200 }),
  addressLine2: rules.optionalText('Address line 2', { max: 200 }),
  country: rules.select('Country'),
  state: rules.select('State'),
  city: rules.optionalText('City', { max: 80 }),
  postalCode: rules.optionalPincode(),
  remarks: rules.optionalText('Remarks', { max: 300 }),

  // Contact & tax
  phone: rules.optionalPhone(),
  fax: rules.optionalText('Fax', { max: 20 }),
  email: rules.optionalEmail(),
  website: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim() || undefined : v),
    z
      .string()
      .regex(/^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i, 'Enter a web address like www.example.com')
      .optional(),
  ),
  gstin: rules.optionalGstin(),
  businessRegNo: optionalCode('Business reg. no.'),
  drugLicenceNo: optionalCode('Drug licence no.'),
  /** Only GST is supported. */
  taxType: z.literal('GST'),
  taxPercent: optionalPercent('Tax %'),
  tinNo: optionalCode('TIN / GST reg. no.'),
  taxTaken: rules.optionalSelect(),
  taxInclusive: z.boolean(),

  // Locale & bill
  currency: rules.select('Default currency'),
  currencySign: rules.text('Currency sign', { max: 5 }),
  dateFormat: rules.select('Date format'),
  timeFormat: rules.select('Time format'),
  billPrintFormat: rules.optionalSelect(),
  barcodePort: rules.optionalSelect(),
  billMessage1: rules.optionalText('Bill message 1', { max: 48 }),
  billMessage2: rules.optionalText('Bill message 2', { max: 48 }),
  displayMessage1: rules.optionalText('Display message 1', { max: 20 }),
  displayMessage2: rules.optionalText('Display message 2', { max: 20 }),

  // POS behaviour
  maxDiscount: percent('Max discount %'),
  maxPriceChange: percent('Max price change %'),
  maxCost: percent('Max cost %'),
  expiredTime: timeRule('Expired time', { required: false }),
  eodDate: dateRule('EOD date', { required: false }),
  roundOff: z.boolean(),
  cashRounding: z.enum(CASH_ROUNDING),
  paymodeDiscount: z.boolean(),
  memberModule: z.boolean(),
  allowMultipleDiscount: z.boolean(),
});

export type CompanyProfileInput = z.input<typeof companyProfileSchema>;
export type CompanyProfileValues = z.output<typeof companyProfileSchema>;
export type CompanyProfileField = keyof CompanyProfileInput;

export const COMPANY_PROFILE_DEFAULTS: CompanyProfileInput = {
  companyCode: 'CMP-01',
  locationCode: 'HQ',
  companyName: '',
  addressLine1: '',
  addressLine2: '',
  country: 'IN',
  state: 'Tamil Nadu',
  city: '',
  postalCode: '',
  remarks: '',
  phone: '',
  fax: '',
  email: '',
  website: '',
  gstin: '',
  businessRegNo: '',
  drugLicenceNo: '',
  taxType: 'GST',
  taxPercent: 0,
  tinNo: '',
  taxTaken: null,
  taxInclusive: false,
  currency: 'INR',
  currencySign: '₹',
  dateFormat: 'dd-MM-yyyy',
  timeFormat: 'HH:mm',
  billPrintFormat: null,
  barcodePort: null,
  billMessage1: '',
  billMessage2: '',
  displayMessage1: '',
  displayMessage2: '',
  maxDiscount: 0,
  maxPriceChange: 0,
  maxCost: 0,
  expiredTime: null,
  eodDate: null,
  roundOff: true,
  cashRounding: 'none',
  paymodeDiscount: false,
  memberModule: false,
  allowMultipleDiscount: false,
};

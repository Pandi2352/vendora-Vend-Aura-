import type { CompanyProfileField } from './companyProfile.schema';

export type CompanySectionKey = 'identity' | 'contact' | 'locale' | 'pos';

export interface CompanySection {
  key: CompanySectionKey;
  label: string;
  subtitle: string;
  /** Material Symbols name. */
  icon: string;
  /** Fields in this section, used for the field count and to jump to errors. */
  fields: CompanyProfileField[];
}

export const COMPANY_SECTIONS: CompanySection[] = [
  {
    key: 'identity',
    label: 'Identity',
    subtitle: 'Who the company is and where it trades from',
    icon: 'badge',
    fields: [
      'companyCode',
      'locationCode',
      'companyName',
      'addressLine1',
      'addressLine2',
      'country',
      'state',
      'city',
      'postalCode',
      'remarks',
    ],
  },
  {
    key: 'contact',
    label: 'Contact & tax',
    subtitle: 'Reach-out details and statutory numbers',
    icon: 'contact_mail',
    fields: [
      'phone',
      'fax',
      'email',
      'website',
      'gstin',
      'businessRegNo',
      'drugLicenceNo',
      'taxType',
      'taxPercent',
      'tinNo',
      'taxTaken',
      'taxInclusive',
    ],
  },
  {
    key: 'locale',
    label: 'Locale & bill',
    subtitle: 'Currency, formats and the printed footer',
    icon: 'receipt_long',
    fields: [
      'currency',
      'currencySign',
      'dateFormat',
      'timeFormat',
      'billPrintFormat',
      'barcodePort',
      'billMessage1',
      'billMessage2',
      'displayMessage1',
      'displayMessage2',
    ],
  },
  {
    key: 'pos',
    label: 'POS behaviour',
    subtitle: 'Limits and rounding the till obeys',
    icon: 'point_of_sale',
    fields: [
      'maxDiscount',
      'maxPriceChange',
      'maxCost',
      'expiredTime',
      'eodDate',
      'roundOff',
      'cashRounding',
      'paymodeDiscount',
      'memberModule',
      'allowMultipleDiscount',
    ],
  },
];

/** First section that has a field with an error, if any. */
export const firstSectionWithError = (errors: Partial<Record<string, unknown>>) =>
  COMPANY_SECTIONS.find((section) => section.fields.some((field) => errors[field]));

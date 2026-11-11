export enum SubscriptionPlanCode {
  FREE_TRIAL = 'FREE_TRIAL',
  STARTER = 'STARTER',
  GROWTH = 'GROWTH',
  BUSINESS = 'BUSINESS',
}

export interface SubscriptionPlanDetails {
  code: SubscriptionPlanCode;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  durationDays: number;
  maxOutlets: number;
  maxUsers: number;
  maxBillsPerMonth: number;
  isPopular?: boolean;
  features: string[];
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanCode, SubscriptionPlanDetails> = {
  [SubscriptionPlanCode.FREE_TRIAL]: {
    code: SubscriptionPlanCode.FREE_TRIAL,
    name: 'Free Trial',
    tagline: 'Try RetailPOS Nova before you subscribe.',
    monthlyPrice: 0,
    annualPrice: 0,
    durationDays: 30,
    maxOutlets: 1,
    maxUsers: 1,
    maxBillsPerMonth: 1000,
    features: [
      '30 Days Free up to 1,000 Bills',
      '1 outlet',
      '1 user',
      'Up to 1,000 bills',
      'Core POS features',
      'Product & barcode management',
      'Basic inventory',
      'Standard reports',
    ],
  },
  [SubscriptionPlanCode.STARTER]: {
    code: SubscriptionPlanCode.STARTER,
    name: 'Starter',
    tagline: 'Ideal for small shops and single-outlet stores.',
    monthlyPrice: 999,
    annualPrice: 9990,
    durationDays: 30,
    maxOutlets: 1,
    maxUsers: 1,
    maxBillsPerMonth: 10000,
    features: [
      '1 outlet',
      'Up to 10,000 bills / month',
      '1 user',
      'POS billing',
      'Product & barcode management',
      'Basic inventory',
      'Standard reports',
      'Cloud backup',
    ],
  },
  [SubscriptionPlanCode.GROWTH]: {
    code: SubscriptionPlanCode.GROWTH,
    name: 'Growth',
    tagline: 'Perfect for busy single-store supermarkets.',
    monthlyPrice: 1799,
    annualPrice: 17990,
    durationDays: 30,
    maxOutlets: 1,
    maxUsers: 5,
    maxBillsPerMonth: 30000,
    isPopular: true,
    features: [
      '1 outlet',
      'Up to 30,000 bills / month',
      '5 users',
      'Purchase management',
      'Inventory & stock transfer',
      'Customer management',
      'GST / tax configuration',
      'Advanced reports',
      'Cloud backup',
    ],
  },
  [SubscriptionPlanCode.BUSINESS]: {
    code: SubscriptionPlanCode.BUSINESS,
    name: 'Business',
    tagline: 'Best for larger stores and multi-outlet operators.',
    monthlyPrice: 3499,
    annualPrice: 34990,
    durationDays: 30,
    maxOutlets: 2,
    maxUsers: 8,
    maxBillsPerMonth: 60000,
    features: [
      '2 outlets',
      'Up to 60,000 bills / month',
      '8 users',
      'Multi-outlet management',
      'Purchase & inventory management',
      'Stock transfer between outlets',
      'Customer & loyalty management',
      'GST / tax configuration',
      'Advanced reports & analytics',
      'Cloud backup',
    ],
  },
};


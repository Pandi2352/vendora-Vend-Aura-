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
    tagline: 'Try Vendora before you subscribe. No credit card required.',
    monthlyPrice: 0,
    annualPrice: 0,
    durationDays: 30,
    maxOutlets: 1,
    maxUsers: 1,
    maxBillsPerMonth: 1000,
    features: [
      '30 Days Free access',
      '1 Outlet / Store location',
      '1 Cashier / Admin User',
      'Up to 1,000 bills',
      'Core POS Billing Counter',
      'Product & Barcode Management',
      'Basic Inventory & Stock Ledger',
      'Standard Daily Reports',
    ],
  },
  [SubscriptionPlanCode.STARTER]: {
    code: SubscriptionPlanCode.STARTER,
    name: 'Starter',
    tagline: 'Ideal for small shops and single-outlet retail stores.',
    monthlyPrice: 999,
    annualPrice: 9990,
    durationDays: 30,
    maxOutlets: 1,
    maxUsers: 1,
    maxBillsPerMonth: 10000,
    features: [
      '1 Outlet / Store location',
      '1 User account',
      'Up to 10,000 bills / month',
      'POS billing with fast barcode search',
      'Thermal receipt printing (58mm/80mm)',
      'Basic Inventory & Stock alerts',
      'GST invoice compliance (CGST/SGST)',
      'Standard Reports & Cloud backup',
    ],
  },
  [SubscriptionPlanCode.GROWTH]: {
    code: SubscriptionPlanCode.GROWTH,
    name: 'Growth',
    tagline: 'Perfect for busy single-store supermarkets and shops.',
    monthlyPrice: 1799,
    annualPrice: 17990,
    durationDays: 30,
    maxOutlets: 1,
    maxUsers: 5,
    maxBillsPerMonth: 30000,
    isPopular: true,
    features: [
      '1 Outlet / Store location',
      'Up to 5 Users with Role Permissions',
      'Up to 30,000 bills / month',
      'Full Purchase Management & GRN',
      'Customer Credit (Khata) & Statements',
      'Held Bills & Recall Cart',
      'Advanced Inventory & Low Stock Alerts',
      'Advanced Business Analytics & P&L',
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
      '2 Outlets / Store locations included',
      'Up to 8 Users with Granular RBAC',
      'Up to 60,000 bills / month',
      'Inter-Branch Stock Transfers',
      'Multi-Outlet Centralized Reports',
      'Customer Loyalty & Points engine',
      'Offline Billing & Background Sync',
      'Priority Support & Dedicated Account Mgr',
    ],
  },
};


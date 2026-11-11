import type { BusinessType, SubscriptionPlanCode, TenantStatus } from '../../shared';

export interface TenantItem {
  id: string;
  shopId: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessType: BusinessType;
  plan: SubscriptionPlanCode;
  status: TenantStatus;
  billsCount: number;
  maxBills?: number;
  trialExpiresAt?: string;
  createdAt: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  gstin?: string;
  outletsCount?: number;
  users?: {
    username: string;
    role: string;
    email: string;
  }[];
}

export interface ContactItem {
  id: string;
  source: 'REGISTERED_TENANT' | 'ONBOARDING_INQUIRY';
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  businessType: BusinessType;
  shopId: string;
  status: string;
  createdAt: string;
}

export interface OverviewStats {
  metrics: {
    totalTenants: number;
    activeTenants: number;
    trialTenants: number;
    suspendedTenants: number;
    totalMonthlyRevenue: number;
    totalBillsGenerated: number;
    totalLeads: number;
  };
  planDistribution: Record<string, number>;
  sectorDistribution: Record<string, number>;
  recentTenants: {
    id: string;
    shopId: string;
    businessName: string;
    ownerName: string;
    businessType: BusinessType;
    status: TenantStatus;
    plan: SubscriptionPlanCode;
    createdAt: string;
  }[];
}

export interface ReportsData {
  sectorStats: Record<string, { count: number; bills: number }>;
  planStats: {
    code: string;
    name: string;
    price: number;
    tenantsCount: number;
    estimatedRevenue: number;
  }[];
  totalTenants: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
}


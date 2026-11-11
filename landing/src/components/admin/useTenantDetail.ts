import { useEffect, useState } from 'react';
import { adminApi } from '../../lib/adminApi';
import { getApiErrorMessage } from '../../lib/apiError';
import { SubscriptionPlanCode } from '../../shared';
import type { BusinessType, TenantStatus } from '../../shared';
import type { TenantItem } from './types';

/** Shape of GET /saas-admin/tenants/:id. Summary-style fields are accepted too in case the server flattens them. */
interface RawTenantDetail {
  id: string;
  shopId: string;
  businessName: string;
  ownerName?: string;
  email?: string;
  phone?: string;
  businessType: BusinessType;
  status: TenantStatus;
  createdAt?: string;
  plan?: SubscriptionPlanCode;
  billsCount?: number;
  maxBills?: number;
  address?: TenantItem['address'];
  gstin?: string;
  outletsCount?: number;
  settings?: { address?: TenantItem['address']; gstin?: string };
  subscription?: {
    planCode?: SubscriptionPlanCode;
    billsGeneratedThisMonth?: number;
    maxBillsPerMonth?: number;
    expiresAt?: string;
  } | null;
  outlets?: unknown[];
  users?: { username: string; role: string; email: string }[];
}

const toDateOnly = (value?: string) => (value ? value.split('T')[0] : '');

function mapTenantDetail(raw: RawTenantDetail): TenantItem {
  const sub = raw.subscription ?? undefined;
  return {
    id: raw.id,
    shopId: raw.shopId,
    businessName: raw.businessName,
    ownerName: raw.ownerName ?? '',
    email: raw.email ?? '',
    phone: raw.phone ?? '',
    businessType: raw.businessType,
    status: raw.status,
    plan: raw.plan ?? sub?.planCode ?? SubscriptionPlanCode.FREE_TRIAL,
    billsCount: raw.billsCount ?? sub?.billsGeneratedThisMonth ?? 0,
    maxBills: raw.maxBills ?? sub?.maxBillsPerMonth,
    trialExpiresAt: toDateOnly(sub?.expiresAt),
    createdAt: toDateOnly(raw.createdAt),
    address: raw.address ?? raw.settings?.address,
    gstin: raw.gstin ?? raw.settings?.gstin,
    outletsCount: raw.outletsCount ?? raw.outlets?.length,
    users: raw.users?.map(({ username, role, email }) => ({ username, role, email })),
  };
}

/** Loads full tenant details whenever `tenantId` changes. */
export function useTenantDetail(tenantId: string | null) {
  const [tenant, setTenant] = useState<TenantItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!tenantId) return;
    let cancelled = false;
    setTenant(null);
    setError('');
    setLoading(true);

    adminApi
      .get(`/tenants/${encodeURIComponent(tenantId)}`)
      .then((res) => {
        if (cancelled) return;
        const raw = res.data?.data as RawTenantDetail | undefined;
        if (raw?.id) {
          setTenant(mapTenantDetail(raw));
        } else {
          setError('Tenant details were not returned by the server.');
        }
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Could not load tenant details.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  return { tenant, loading, error };
}

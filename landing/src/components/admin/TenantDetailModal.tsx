import {
  X,
  Buildings,
  Users,
  Phone,
  EnvelopeSimple,
  MapPin,
  ArrowSquareOut,
  IdentificationCard,
  CreditCard,
  CircleNotch,
  WarningCircle,
} from '@phosphor-icons/react';
import type { TenantItem } from './types';
import { TenantStatusBadge } from './TenantStatusBadge';
import { useTenantDetail } from './useTenantDetail';
import { BUSINESS_TYPE_LABELS } from '../../shared';
import { posLoginUrl, storeHost } from '../../lib/config';

interface TenantDetailModalProps {
  tenantId: string;
  /** Summary row already loaded in the list, shown while full details are fetched. */
  fallback?: TenantItem;
  onClose: () => void;
}

export function TenantDetailModal({ tenantId, fallback, onClose }: TenantDetailModalProps) {
  const { tenant: detail, loading, error } = useTenantDetail(tenantId);
  const tenant = detail ?? fallback ?? null;

  if (!tenant) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70">
        <div className="bg-white rounded-md border border-zinc-300 w-full max-w-md p-5 space-y-4 text-xs">
          {loading ? (
            <p className="flex items-center gap-2 text-zinc-700 font-medium">
              <CircleNotch className="w-4 h-4 animate-spin text-red-600" />
              <span>Loading tenant details...</span>
            </p>
          ) : (
            <p className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 font-medium flex items-start gap-2">
              <WarningCircle weight="bold" className="w-4 h-4 shrink-0" />
              <span>{error || 'Tenant not found.'}</span>
            </p>
          )}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-md bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-semibold cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70">
      <div className="bg-white rounded-md border border-zinc-300 w-full max-w-xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-white border border-zinc-200 flex items-center justify-center text-red-600 shrink-0">
              <Buildings weight="bold" className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-950 leading-tight">
                  {tenant.businessName}
                </h3>
                <TenantStatusBadge status={tenant.status} />
              </div>
              <p className="text-xs text-red-600 font-mono mt-0.5">{storeHost(tenant.shopId)}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-zinc-200 hover:bg-zinc-300 text-zinc-700 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          {loading && (
            <p className="flex items-center gap-2 text-zinc-500 font-medium">
              <CircleNotch className="w-3.5 h-3.5 animate-spin text-red-600" />
              <span>Refreshing full tenant details...</span>
            </p>
          )}
          {error && (
            <p className="p-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 font-medium flex items-start gap-2">
              <WarningCircle weight="bold" className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{error} Showing the summary from the tenant list.</span>
            </p>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-md bg-zinc-50 border border-zinc-200">
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Plan</span>
              <span className="font-bold text-zinc-900 mt-0.5 block">{tenant.plan}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Sector</span>
              <span className="font-bold text-zinc-900 mt-0.5 block truncate">
                {BUSINESS_TYPE_LABELS[tenant.businessType] || tenant.businessType}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Bills Done</span>
              <span className="font-bold text-zinc-900 mt-0.5 block font-mono">
                {tenant.billsCount.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Joined</span>
              <span className="font-bold text-zinc-900 mt-0.5 block font-mono">
                {tenant.createdAt || 'Recent'}
              </span>
            </div>
          </div>

          {/* Owner & Contact Details */}
          <div className="space-y-2 border-t border-zinc-100 pt-3">
            <h4 className="font-bold text-zinc-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
              <IdentificationCard className="w-3.5 h-3.5 text-zinc-600" />
              <span>Owner & Contact Details</span>
            </h4>
            <div className="space-y-1.5 text-zinc-700 bg-zinc-50 p-3 rounded-md border border-zinc-200">
              <p className="flex items-center gap-2">
                <Users weight="bold" className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span className="font-medium text-zinc-950">{tenant.ownerName || 'Store Owner'}</span>
              </p>
              {tenant.email && (
                <p className="flex items-center gap-2">
                  <EnvelopeSimple weight="bold" className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span>{tenant.email}</span>
                </p>
              )}
              {tenant.phone && (
                <p className="flex items-center gap-2">
                  <Phone weight="bold" className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span>{tenant.phone}</span>
                </p>
              )}
              {tenant.address && (tenant.address.street || tenant.address.city) && (
                <p className="flex items-start gap-2">
                  <MapPin weight="bold" className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                  <span>
                    {[tenant.address.street, tenant.address.city, tenant.address.state, tenant.address.pincode]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </p>
              )}
              {tenant.gstin && (
                <p className="flex items-center gap-2 text-[11px] font-mono text-zinc-600 pt-1 border-t border-zinc-200">
                  <CreditCard className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span>GSTIN: <strong className="text-zinc-900">{tenant.gstin}</strong></span>
                </p>
              )}
            </div>
          </div>

          {/* Staff Accounts */}
          {tenant.users && tenant.users.length > 0 && (
            <div className="space-y-2 border-t border-zinc-100 pt-3">
              <h4 className="font-bold text-zinc-900 uppercase text-[10px] tracking-wider">
                Staff & Cashier Logins ({tenant.users.length})
              </h4>
              <div className="space-y-1.5">
                {tenant.users.map((u, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-md bg-zinc-50 border border-zinc-200 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-bold text-zinc-950">{u.username}</span>
                      <span className="text-zinc-500 ml-2 text-[11px]">({u.email})</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-200 text-zinc-800 text-[10px] font-bold">
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="text-[11px] text-zinc-500 font-mono">
            Tenant ID: {tenant.id.slice(0, 10)}...
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-md bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-semibold cursor-pointer transition-colors"
            >
              Close
            </button>
            <a
              href={posLoginUrl(tenant.shopId)}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>Launch POS Terminal</span>
              <ArrowSquareOut weight="bold" className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

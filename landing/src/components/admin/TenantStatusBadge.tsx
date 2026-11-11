import { TenantStatus } from '../../shared';

const STATUS_STYLES: Record<TenantStatus, { className: string; label: string }> = {
  [TenantStatus.ACTIVE]: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Active' },
  [TenantStatus.TRIAL]: { className: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Trial' },
  [TenantStatus.SUSPENDED]: { className: 'bg-red-50 text-red-700 border-red-200', label: 'Suspended' },
  [TenantStatus.EXPIRED]: { className: 'bg-amber-50 text-amber-800 border-amber-200', label: 'Expired' },
};

interface TenantStatusBadgeProps {
  status: TenantStatus;
  className?: string;
}

/** Tinted status pill with a dot, so state never relies on colour alone. */
export function TenantStatusBadge({ status, className = '' }: TenantStatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? { className: 'bg-zinc-50 text-zinc-700 border-zinc-200', label: status };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-bold ${style.className} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden />
      {style.label}
    </span>
  );
}

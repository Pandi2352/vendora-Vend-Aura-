import { TenantStatus } from '../../shared';

const STATUS_CLASSES: Record<TenantStatus, string> = {
  [TenantStatus.ACTIVE]: 'bg-zinc-950 text-white',
  [TenantStatus.TRIAL]: 'bg-red-50 text-red-700 border border-red-200',
  [TenantStatus.SUSPENDED]: 'bg-zinc-200 text-zinc-700',
  [TenantStatus.EXPIRED]: 'bg-amber-50 text-amber-800 border border-amber-200',
};

interface TenantStatusBadgeProps {
  status: TenantStatus;
  className?: string;
}

export function TenantStatusBadge({ status, className = '' }: TenantStatusBadgeProps) {
  return (
    <span
      className={`inline-block px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
        STATUS_CLASSES[status] ?? 'bg-zinc-200 text-zinc-700'
      } ${className}`}
    >
      {status}
    </span>
  );
}

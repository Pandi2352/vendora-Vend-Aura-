import { SignOut } from '@phosphor-icons/react';
import { useAuth } from '../../hooks/useAuth';
import { ROLE_LABELS } from '../../lib/permissions';
import { initialOf } from '@/utils';
import { cn } from '../ui/cn';

/** Signed-in user at the foot of the sidebar: avatar, name, role / email and sign out. */
export function SidebarUserCard({ collapsed }: { collapsed: boolean }) {
  const { user, logout } = useAuth();
  const name = user?.fullName || user?.username || 'User';
  const detail = user?.email || ROLE_LABELS[user?.role ?? ''] || user?.role;

  return (
    <div className={cn('flex items-center gap-2.5 p-2.5', collapsed && 'flex-col gap-1.5')}>
      <span
        title={collapsed ? name : undefined}
        className="w-8 h-8 rounded-full bg-primary-600 text-white text-[0.8125rem] font-bold inline-flex items-center justify-center shrink-0"
        aria-hidden={!collapsed}
      >
        {initialOf(name)}
      </span>
      {!collapsed && (
        <span className="flex-1 min-w-0 leading-tight">
          <span className="block text-[0.8125rem] font-semibold text-shell-text truncate">{name}</span>
          <span className="block text-[0.6875rem] text-shell-muted truncate">{detail}</span>
        </span>
      )}
      <button
        type="button"
        onClick={logout}
        aria-label="Sign out"
        title="Sign out"
        className="w-8 h-8 inline-flex items-center justify-center rounded-md text-shell-muted hover:bg-shell-hover hover:text-red-600 transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-primary-500"
      >
        <SignOut className="w-4 h-4" />
      </button>
    </div>
  );
}

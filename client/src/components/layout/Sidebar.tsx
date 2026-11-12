import { navigationForRole } from '../../config/navigation';
import { useAuth } from '../../hooks/useAuth';
import { SidebarNavItem } from './SidebarNavItem';
import { cn } from '../ui/cn';

interface SidebarProps {
  collapsed: boolean;
  /** Mobile drawer state; ignored on large screens. */
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

/** Left navigation: expanded (icons + labels) or collapsed (icons only); off-canvas drawer on small screens. */
export function Sidebar({ collapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const { user, logout } = useAuth();
  const items = navigationForRole(user?.role);
  // The mobile drawer always shows labels.
  const showCollapsed = collapsed && !mobileOpen;

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        />
      )}
      <aside
        aria-label="Main navigation"
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-40 flex flex-col bg-shell border-r border-shell-border',
          'transition-[width] duration-200 shrink-0',
          'top-14 lg:top-0',
          showCollapsed ? 'w-16' : 'w-60',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <nav className="flex-1 overflow-y-auto scrollbar-shell p-2.5 space-y-1">
          {items.map((item) => (
            <SidebarNavItem key={item.label} item={item} collapsed={showCollapsed} onNavigate={onCloseMobile} />
          ))}
        </nav>

        <div className="border-t border-[#1a2a47] p-2.5">
          <button
            type="button"
            onClick={logout}
            title={showCollapsed ? 'Sign out' : undefined}
            aria-label="Sign out"
            className={cn(
              'group w-full flex items-center gap-3 h-9 rounded-lg text-xs font-bold text-[#cbd5e6] hover:bg-[#1a2b4c] hover:text-white transition-colors cursor-pointer',
              showCollapsed ? 'justify-center' : 'px-3',
            )}
          >
            <span className="ms text-[16px] text-[#7b89a3] group-hover:text-white ms-hover-fill shrink-0 transition-colors">
              logout
            </span>
            {!showCollapsed && (
              <span className="truncate">Sign out · Administrator</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

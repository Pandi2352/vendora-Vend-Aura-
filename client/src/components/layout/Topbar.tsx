import { Link } from 'react-router-dom';
import {
  List,
  SidebarSimple,
  Headset,
  Storefront,
  Moon,
  Sun,
  CornersOut,
  CornersIn,
  MagnifyingGlass,
} from '@phosphor-icons/react';
import { useAuth } from '../../hooks/useAuth';
import { usePreferences } from '../../hooks/usePreferences';
import { useFullscreen } from '../../hooks/useFullscreen';
import { ROUTES } from '../../config/routes';
import { SUPPORT_EMAIL } from '../../lib/config';
import { BrandMark } from './BrandMark';
import { ShiftStatusChip } from './ShiftStatusChip';
import { NetworkStatusChip } from './NetworkStatusChip';
import { TopbarIconButton } from './TopbarIconButton';
import { UserMenu } from './UserMenu';
import { cn } from '../ui/cn';
import { CommandHotkeyHint } from '../ui/command/Kbd';

interface TopbarProps {
  onOpenMobileNav: () => void;
  /** Opens the command palette. */
  onOpenSearch: () => void;
}

export function Topbar({ onOpenMobileNav, onOpenSearch }: TopbarProps) {
  const { user } = useAuth();
  const { theme, toggleTheme, sidebarCollapsed, toggleSidebar } = usePreferences();
  const fullscreen = useFullscreen();

  return (
    <header className="h-14 shrink-0 bg-shell border-b border-shell-border flex items-center gap-2 pr-3 sm:pr-4">
      {/* Brand column lines up with the sidebar width */}
      <div
        className={cn(
          'flex items-center h-full pl-3 gap-2 shrink-0 transition-[width] duration-200',
          sidebarCollapsed ? 'lg:w-16' : 'lg:w-60',
        )}
      >
        <TopbarIconButton label="Open menu" onClick={onOpenMobileNav} className="lg:hidden">
          <List />
        </TopbarIconButton>
        <Link to={ROUTES.DASHBOARD} className="min-w-0" aria-label="Dashboard">
          <BrandMark subtitle={user?.businessName} compact={sidebarCollapsed} />
        </Link>
      </div>

      <TopbarIconButton
        label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        onClick={toggleSidebar}
        className="hidden lg:inline-flex"
      >
        <SidebarSimple />
      </TopbarIconButton>

      <button
        type="button"
        onClick={onOpenSearch}
        aria-keyshortcuts="Control+K Meta+K"
        className="hidden sm:inline-flex items-center gap-2 h-9 w-44 lg:w-60 px-3 rounded-md border border-shell-border bg-shell-raised text-shell-muted text-sm hover:border-zinc-300 hover:text-shell-text transition-colors cursor-pointer"
      >
        <MagnifyingGlass className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left">Search…</span>
        <CommandHotkeyHint className="border-shell-border bg-shell-raised text-shell-muted" />
      </button>
      <TopbarIconButton label="Search" onClick={onOpenSearch} className="sm:hidden">
        <MagnifyingGlass />
      </TopbarIconButton>

      <div className="flex-1" />

      <a
        href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Support request · ${user?.shopId ?? ''}`)}`}
        className="hidden sm:inline-flex items-center gap-2 h-9 px-3 rounded-md border border-primary-200 bg-primary-50 text-primary-700 text-sm font-bold hover:bg-primary-100 transition-colors"
      >
        <Headset className="w-4 h-4" /> Support
      </a>

      <span className="hidden md:inline-flex items-center gap-2 h-9 px-3 rounded-md border border-shell-border bg-shell-raised text-shell-text text-sm font-semibold">
        <Storefront className="w-4 h-4" />
        <span className="max-w-[8.75rem] truncate">{user?.store?.outletCode ?? 'Main Branch'}</span>
      </span>

      <ShiftStatusChip />
      <NetworkStatusChip />

      <TopbarIconButton
        label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        onClick={toggleTheme}
      >
        {theme === 'dark' ? <Sun /> : <Moon />}
      </TopbarIconButton>

      <TopbarIconButton
        label={fullscreen.isFullscreen ? 'Exit full screen' : 'Full screen'}
        onClick={fullscreen.toggle}
        className="hidden sm:inline-flex"
      >
        {fullscreen.isFullscreen ? <CornersIn /> : <CornersOut />}
      </TopbarIconButton>

      <UserMenu />
    </header>
  );
}

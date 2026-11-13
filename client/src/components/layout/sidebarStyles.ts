import { cn } from '../ui/cn';
import type { SidebarStyle, NavbarStyle, SurfaceStyle } from '../../lib/theme';

export function sidebarContainerClass(style: SidebarStyle = 'default', surface: SurfaceStyle = 'flat') {
  const glass = surface === 'glass' ? 'backdrop-blur-md bg-opacity-90' : '';
  const bordered = surface === 'bordered' ? 'border-r-2' : '';

  switch (style) {
    case 'dark':
      return cn('bg-zinc-950 border-zinc-800 text-zinc-100 shadow-sm', glass, bordered);
    case 'brand':
      return cn('bg-primary-50/70 border-primary-200/60 text-primary-950', glass, bordered);
    case 'contrast':
      return cn('bg-white border-zinc-200 text-zinc-800 shadow-xs', glass, bordered);
    case 'default':
    default:
      return cn('bg-shell border-shell-border text-shell-text', glass, bordered);
  }
}

export function topbarContainerClass(style: NavbarStyle = 'default', surface: SurfaceStyle = 'flat') {
  const glass = surface === 'glass' ? 'backdrop-blur-md bg-opacity-85' : '';
  const bordered = surface === 'bordered' ? 'border-b-2' : '';

  switch (style) {
    case 'dark':
      return cn('bg-zinc-950 border-zinc-800 text-white shadow-sm', glass, bordered);
    case 'brand':
      return cn('bg-primary-600 border-primary-700 text-white shadow-sm', glass, bordered);
    case 'card':
      return cn('bg-white border-zinc-200 text-zinc-900 shadow-xs', glass, bordered);
    case 'default':
    default:
      return cn('bg-shell border-shell-border text-shell-text', glass, bordered);
  }
}

/**
 * Shared look for sidebar rows.
 */
export function navRowClass(active: boolean, collapsed = false, style: SidebarStyle = 'default') {
  let inactiveClass = 'text-shell-text font-medium hover:bg-shell-hover';
  let activeClass = 'bg-primary-50 text-primary-700 font-semibold';

  if (style === 'dark') {
    inactiveClass = 'text-zinc-400 font-medium hover:text-white hover:bg-zinc-800/80';
    activeClass = 'bg-primary-600 text-white font-semibold shadow-xs';
  } else if (style === 'brand') {
    inactiveClass = 'text-primary-900/90 font-medium hover:bg-primary-100/60';
    activeClass = 'bg-primary-600 text-white font-semibold shadow-xs';
  } else if (style === 'contrast') {
    inactiveClass = 'text-zinc-600 font-medium hover:text-zinc-900 hover:bg-zinc-100';
    activeClass = 'bg-primary-50 text-primary-700 font-semibold border border-primary-200/60';
  }

  return cn(
    'group relative w-full flex items-center gap-2.5 h-9 rounded-md text-sm transition-colors cursor-pointer',
    'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-500',
    collapsed ? 'justify-center px-0' : 'px-2.5',
    active ? activeClass : inactiveClass,
  );
}

export function navIconClass(active: boolean, style: SidebarStyle = 'default') {
  if (style === 'dark') {
    return cn(
      'shrink-0 text-[1.125rem] transition-colors',
      active ? 'text-white ms-fill' : 'text-zinc-400 group-hover:text-white',
    );
  }
  if (style === 'brand') {
    return cn(
      'shrink-0 text-[1.125rem] transition-colors',
      active ? 'text-white ms-fill' : 'text-primary-700 group-hover:text-primary-900',
    );
  }
  return cn(
    'shrink-0 text-[1.125rem] transition-colors',
    active ? 'text-primary-600 ms-fill' : 'text-shell-muted group-hover:text-shell-text',
  );
}

/** Child row inside an expanded group (indented, no icon). */
export function navChildClass(active: boolean, style: SidebarStyle = 'default') {
  let inactiveClass = 'text-shell-text hover:bg-shell-hover';
  let activeClass = 'bg-primary-50 text-primary-700 font-semibold';

  if (style === 'dark') {
    inactiveClass = 'text-zinc-400 hover:text-white hover:bg-zinc-800/80';
    activeClass = 'bg-primary-600 text-white font-semibold shadow-xs';
  } else if (style === 'brand') {
    inactiveClass = 'text-primary-900/80 hover:bg-primary-100/60';
    activeClass = 'bg-primary-600 text-white font-semibold shadow-xs';
  } else if (style === 'contrast') {
    inactiveClass = 'text-zinc-600 hover:bg-zinc-100';
    activeClass = 'bg-primary-50 text-primary-700 font-semibold border border-primary-200/60';
  }

  return cn(
    'flex items-center h-8 px-2.5 rounded-md text-sm transition-colors',
    'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-500',
    active ? activeClass : inactiveClass,
  );
}

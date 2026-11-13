import { cn } from '../ui/cn';

/**
 * Shared look for sidebar rows. Light warm shell; the active page uses the
 * theme's light blue (primary-50 fill, primary-700 text), hover is a soft grey.
 */
export function navRowClass(active: boolean, collapsed = false) {
  return cn(
    'group relative w-full flex items-center gap-2.5 h-9 rounded-md text-sm transition-colors cursor-pointer',
    'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-500',
    collapsed ? 'justify-center px-0' : 'px-2.5',
    active ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-shell-text font-medium hover:bg-shell-hover',
  );
}

export function navIconClass(active: boolean) {
  return cn(
    'shrink-0 text-[1.125rem] transition-colors',
    active ? 'text-primary-600 ms-fill' : 'text-shell-muted group-hover:text-shell-text',
  );
}

/** Child row inside an expanded group (indented, no icon). */
export function navChildClass(active: boolean) {
  return cn(
    'flex items-center h-8 px-2.5 rounded-md text-sm transition-colors',
    'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-500',
    active ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-shell-text hover:bg-shell-hover',
  );
}

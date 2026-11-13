import type { ComponentType } from 'react';
import { ROUTES } from './routes';
import { ROLE_GROUPS, hasRole, type UserRole } from '../lib/permissions';
import { ms } from '../components/ui/ms';

export interface NavItem {
  label: string;
  /** Leaf items navigate; parents open a flyout with their children. */
  path?: string;
  icon: ComponentType<{ className?: string }>;
  roles?: UserRole[];
  children?: NavItem[];
  /** Heading shown at the top of the flyout. */
  sectionTitle?: string;
  badgeDot?: boolean;
}

/** Single source for the sidebar, flyout menus and breadcrumbs matching reference UI. */
export const NAVIGATION: NavItem[] = [
  { label: 'Setup', path: ROUTES.SETUP, icon: ms('rocket_launch'), roles: ROLE_GROUPS.MANAGEMENT, badgeDot: true },
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: ms('grid_view') },
  {
    label: 'General Master',
    icon: ms('folder_special'),
    roles: ROLE_GROUPS.MANAGEMENT,
    sectionTitle: 'GENERAL MASTER',
    children: [
      { label: 'Master', path: ROUTES.MASTER, icon: ms('folder_special') },
      { label: 'Inventory', path: ROUTES.INVENTORY, icon: ms('category') },
      { label: 'Customer', path: ROUTES.CUSTOMERS, icon: ms('group') },
      { label: 'Sales', path: ROUTES.ORDERS, icon: ms('sell') },
      { label: 'Purchase', path: ROUTES.SUPPLIERS, icon: ms('receipt_long') },
    ],
  },
  {
    label: 'Inventory Master',
    icon: ms('dashboard_customize'),
    roles: ROLE_GROUPS.MANAGEMENT,
    sectionTitle: 'Inventory Master',
    children: [
      { label: 'Item Catalog', path: ROUTES.INVENTORY, icon: ms('inventory_2') },
      { label: 'Categories & Brands', path: `${ROUTES.INVENTORY}?tab=categories`, icon: ms('category') },
      { label: 'Opening Stock', path: `${ROUTES.INVENTORY}?tab=stock`, icon: ms('assignment') },
      { label: 'Barcode Generator', path: `${ROUTES.INVENTORY}?tab=barcodes`, icon: ms('qr_code_2') },
    ],
  },
  {
    label: 'Merchandising',
    icon: ms('sell'),
    roles: ROLE_GROUPS.MANAGEMENT,
    sectionTitle: 'Merchandising',
    children: [
      { label: 'Discounts & Offers', path: `${ROUTES.ORDERS}?tab=discounts`, icon: ms('sell') },
      { label: 'Customer Khata', path: `${ROUTES.CUSTOMERS}?tab=khata`, icon: ms('group') },
    ],
  },
  {
    label: 'Purchase',
    icon: ms('shopping_bag'),
    roles: ROLE_GROUPS.MANAGEMENT,
    sectionTitle: 'Purchase & Inward',
    children: [
      { label: 'Suppliers Directory', path: ROUTES.SUPPLIERS, icon: ms('group') },
      { label: 'Inward Stock (GRN)', path: `${ROUTES.SUPPLIERS}?tab=inwards&action=inward`, icon: ms('local_shipping') },
    ],
  },
  {
    label: 'Management',
    icon: ms('trending_up'),
    roles: ROLE_GROUPS.MANAGEMENT,
    sectionTitle: 'Store Management',
    children: [
      { label: 'Daily Shifts & Drawer', path: `${ROUTES.DASHBOARD}?tab=shifts`, icon: ms('point_of_sale') },
      { label: 'Accounts & Expenses', path: ROUTES.FINANCE, icon: ms('account_balance') },
    ],
  },
  {
    label: 'Reports',
    icon: ms('bar_chart'),
    roles: ROLE_GROUPS.FINANCE,
    sectionTitle: 'Reports & Analytics',
    children: [
      { label: 'Executive Overview', path: ROUTES.REPORTS_OVERVIEW, icon: ms('insights') },
      { label: 'GST Tax Reports', path: ROUTES.REPORTS_GST, icon: ms('account_balance') },
      { label: 'Inventory Valuation', path: ROUTES.REPORTS_INVENTORY, icon: ms('inventory') },
    ],
  },
  {
    label: 'Stock',
    icon: ms('assignment'),
    roles: ROLE_GROUPS.MANAGEMENT,
    sectionTitle: 'Stock Control',
    children: [
      { label: 'Stock Ledger', path: `${ROUTES.REPORTS_INVENTORY}?tab=ledger`, icon: ms('assignment') },
      { label: 'Physical Inventory', path: `${ROUTES.REPORTS_INVENTORY}?tab=physical`, icon: ms('inventory_2') },
    ],
  },
  {
    label: 'Transfers',
    icon: ms('sync_alt'),
    roles: ROLE_GROUPS.MANAGEMENT,
    sectionTitle: 'Outlet Stock Transfers',
    children: [{ label: 'Inter-Branch Transfers', path: `${ROUTES.INVENTORY}?tab=transfers`, icon: ms('sync_alt') }],
  },
  {
    label: 'Users & Roles',
    icon: ms('group'),
    roles: ROLE_GROUPS.MANAGEMENT,
    sectionTitle: 'Access Control',
    children: [{ label: 'Staff & Cashiers', path: `${ROUTES.SETTINGS}?tab=users`, icon: ms('group') }],
  },
  {
    label: 'Administrator',
    path: `${ROUTES.SETTINGS}?tab=general`,
    icon: ms('admin_panel_settings'),
    roles: ROLE_GROUPS.MANAGEMENT,
  },
  { label: 'POS', path: ROUTES.POS, icon: ms('storefront'), badgeDot: true },
  { label: 'Home Delivery', path: `${ROUTES.ORDERS}?tab=delivery`, icon: ms('local_shipping') },
  { label: 'POS Utilities', path: `${ROUTES.ORDERS}?tab=utilities`, icon: ms('receipt_long') },
  { label: 'Settings', path: ROUTES.SETTINGS, icon: ms('settings') },
];

/** Removes items (and children) the role may not see; drops parents left empty. */
export function navigationForRole(role: string | undefined, items: NavItem[] = NAVIGATION): NavItem[] {
  return items
    .filter((item) => hasRole(role, item.roles))
    .map((item) => (item.children ? { ...item, children: navigationForRole(role, item.children) } : item))
    .filter((item) => !item.children || item.children.length > 0);
}

/** True when the item or any of its children matches the current path. */
export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.path) {
    const pure = item.path.split('?')[0];
    if (pure && (pathname === pure || pathname.startsWith(`${pure}/`))) return true;
  }
  return !!item.children?.some((child) => isNavItemActive(child, pathname));
}

/** Label trail for the current path, e.g. ['Reports', 'GST Reports']. */
export function breadcrumbTrail(pathname: string, items: NavItem[] = NAVIGATION): string[] {
  for (const item of items) {
    if (!isNavItemActive(item, pathname)) continue;
    const childTrail = item.children ? breadcrumbTrail(pathname, item.children) : [];
    return [item.label, ...childTrail];
  }
  return [];
}

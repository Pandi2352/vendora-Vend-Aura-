import { lazy, Suspense, type ReactNode } from 'react';
import { PageLoader } from '../components/ui/Spinner';

// Back-office pages load on demand to keep the till's first load small.
export const OrdersPage = lazy(() => import('../pages/OrdersPage').then((m) => ({ default: m.OrdersPage })));
export const CustomersPage = lazy(() => import('../pages/CustomersPage').then((m) => ({ default: m.CustomersPage })));
export const SuppliersPage = lazy(() => import('../pages/SuppliersPage').then((m) => ({ default: m.SuppliersPage })));
export const FinancePage = lazy(() => import('../pages/FinancePage').then((m) => ({ default: m.FinancePage })));
export const ReportsPage = lazy(() => import('../pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
export const SettingsPage = lazy(() => import('../pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
export const MasterPage = lazy(() => import('../modules/master').then((m) => ({ default: m.MasterPage })));
export const InventoryPage = lazy(() => import('../pages/InventoryPage').then((m) => ({ default: m.InventoryPage })));
export const SetupPage = lazy(() => import('../pages/SetupPage').then((m) => ({ default: m.SetupPage })));

/** Shows the page loader while a lazy page's code downloads. */
export function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

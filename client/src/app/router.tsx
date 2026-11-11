import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { ROLE_GROUPS } from '../lib/permissions';
import { AppLayout } from '../layouts/AppLayout';
import { RedirectIfAuthenticated, RequireAuth, RequirePasswordChange, RequireRole } from '../routes/guards';
import { LoginPage } from '../pages/LoginPage';
import { ChangePasswordPage } from '../pages/ChangePasswordPage';
import { DashboardPage } from '../pages/DashboardPage';
import { PosPage } from '../pages/PosPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Back-office pages load on demand to keep the till's first load small.
const OrdersPage = lazy(() => import('../pages/OrdersPage').then((m) => ({ default: m.OrdersPage })));
const CustomersPage = lazy(() => import('../pages/CustomersPage').then((m) => ({ default: m.CustomersPage })));
const SuppliersPage = lazy(() => import('../pages/SuppliersPage').then((m) => ({ default: m.SuppliersPage })));
const ReportsPage = lazy(() => import('../pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('../pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));

const PageFallback = () => <div className="p-6 text-sm text-zinc-400">Loading…</div>;
const lazyPage = (page: ReactNode) => <Suspense fallback={<PageFallback />}>{page}</Suspense>;

/**
 * Flow: welcome email link -> /login?shopId=… -> (first login) /change-password -> /dashboard.
 */
export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: (
      <RedirectIfAuthenticated>
        <LoginPage />
      </RedirectIfAuthenticated>
    ),
  },
  {
    path: ROUTES.CHANGE_PASSWORD,
    element: (
      <RequirePasswordChange>
        <ChangePasswordPage />
      </RequirePasswordChange>
    ),
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to={ROUTES.DASHBOARD} replace /> },
          { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
          { path: ROUTES.POS, element: <PosPage /> },
          { path: ROUTES.ORDERS, element: lazyPage(<OrdersPage />) },
          { path: ROUTES.CUSTOMERS, element: lazyPage(<CustomersPage />) },
          {
            path: ROUTES.SUPPLIERS,
            element: <RequireRole roles={ROLE_GROUPS.MANAGEMENT}>{lazyPage(<SuppliersPage />)}</RequireRole>,
          },
          { path: ROUTES.REPORTS, element: <Navigate to={ROUTES.REPORTS_OVERVIEW} replace /> },
          {
            path: `${ROUTES.REPORTS}/:tab`,
            element: <RequireRole roles={ROLE_GROUPS.FINANCE}>{lazyPage(<ReportsPage />)}</RequireRole>,
          },
          { path: ROUTES.SETTINGS, element: lazyPage(<SettingsPage />) },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);

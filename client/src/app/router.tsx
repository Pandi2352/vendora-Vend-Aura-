import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { PageLoader } from '../components/ui/Spinner';
import { ROLE_GROUPS } from '../lib/permissions';
import { AppLayout } from '../layouts/AppLayout';
import { RedirectIfAuthenticated, RequireAuth, RequirePasswordChange, RequireRole } from '../routes/guards';
import { LoginPage } from '../pages/LoginPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { ChangePasswordPage } from '../pages/ChangePasswordPage';
import { DashboardPage } from '../pages/DashboardPage';
import { PosPage } from '../pages/PosPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { RouteErrorPage, UnauthorizedPage } from '../pages/StatusPages';

// Back-office pages load on demand to keep the till's first load small.
const OrdersPage = lazy(() => import('../pages/OrdersPage').then((m) => ({ default: m.OrdersPage })));
const CustomersPage = lazy(() => import('../pages/CustomersPage').then((m) => ({ default: m.CustomersPage })));
const SuppliersPage = lazy(() => import('../pages/SuppliersPage').then((m) => ({ default: m.SuppliersPage })));
const FinancePage = lazy(() => import('../pages/FinancePage').then((m) => ({ default: m.FinancePage })));
const ReportsPage = lazy(() => import('../pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('../pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const SetupPage = lazy(() => import('../pages/SetupPage').then((m) => ({ default: m.SetupPage })));

const PageFallback = () => <PageLoader />;
const lazyPage = (page: ReactNode) => <Suspense fallback={<PageFallback />}>{page}</Suspense>;

/**
 * Flow: welcome email link -> /login?shopId=… -> (first login) /change-password -> /dashboard.
 * Recovery: /forgot-password -> emailed link /reset-password?token=…&shopId=… -> /login?shopId=….
 */
export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    errorElement: <RouteErrorPage />,
    element: (
      <RedirectIfAuthenticated>
        <LoginPage />
      </RedirectIfAuthenticated>
    ),
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    errorElement: <RouteErrorPage />,
    element: (
      <RedirectIfAuthenticated>
        <ForgotPasswordPage />
      </RedirectIfAuthenticated>
    ),
  },
  {
    path: ROUTES.RESET_PASSWORD,
    errorElement: <RouteErrorPage />,
    element: (
      <RedirectIfAuthenticated>
        <ResetPasswordPage />
      </RedirectIfAuthenticated>
    ),
  },
  {
    path: ROUTES.CHANGE_PASSWORD,
    errorElement: <RouteErrorPage />,
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
        errorElement: <RouteErrorPage />,
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
          {
            path: ROUTES.FINANCE,
            element: <RequireRole roles={ROLE_GROUPS.MANAGEMENT}>{lazyPage(<FinancePage />)}</RequireRole>,
          },
          { path: ROUTES.REPORTS, element: <Navigate to={ROUTES.REPORTS_OVERVIEW} replace /> },
          {
            path: `${ROUTES.REPORTS}/:tab`,
            element: <RequireRole roles={ROLE_GROUPS.FINANCE}>{lazyPage(<ReportsPage />)}</RequireRole>,
          },
          { path: ROUTES.SETTINGS, element: lazyPage(<SettingsPage />) },
          { path: ROUTES.SETUP, element: lazyPage(<SetupPage />) },
          { path: ROUTES.UNAUTHORIZED, element: <UnauthorizedPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);

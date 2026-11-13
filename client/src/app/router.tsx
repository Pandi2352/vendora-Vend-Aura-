import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
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
import {
  OrdersPage,
  CustomersPage,
  SuppliersPage,
  FinancePage,
  ReportsPage,
  SettingsPage,
  MasterPage,
  SetupPage,
  LazyPage,
} from './lazyPages';

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
          {
            path: ROUTES.ORDERS,
            element: (
              <LazyPage>
                <OrdersPage />
              </LazyPage>
            ),
          },
          {
            path: ROUTES.CUSTOMERS,
            element: (
              <LazyPage>
                <CustomersPage />
              </LazyPage>
            ),
          },
          {
            path: ROUTES.SUPPLIERS,
            element: (
              <RequireRole roles={ROLE_GROUPS.MANAGEMENT}>
                {
                  <LazyPage>
                    <SuppliersPage />
                  </LazyPage>
                }
              </RequireRole>
            ),
          },
          {
            path: ROUTES.FINANCE,
            element: (
              <RequireRole roles={ROLE_GROUPS.MANAGEMENT}>
                {
                  <LazyPage>
                    <FinancePage />
                  </LazyPage>
                }
              </RequireRole>
            ),
          },
          { path: ROUTES.REPORTS, element: <Navigate to={ROUTES.REPORTS_OVERVIEW} replace /> },
          {
            path: `${ROUTES.REPORTS}/:tab`,
            element: (
              <RequireRole roles={ROLE_GROUPS.FINANCE}>
                {
                  <LazyPage>
                    <ReportsPage />
                  </LazyPage>
                }
              </RequireRole>
            ),
          },
          {
            path: ROUTES.MASTER,
            element: (
              <LazyPage>
                <MasterPage />
              </LazyPage>
            ),
          },
          {
            path: ROUTES.SETTINGS,
            element: (
              <LazyPage>
                <SettingsPage />
              </LazyPage>
            ),
          },
          {
            path: ROUTES.SETUP,
            element: (
              <LazyPage>
                <SetupPage />
              </LazyPage>
            ),
          },
          { path: ROUTES.UNAUTHORIZED, element: <UnauthorizedPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);

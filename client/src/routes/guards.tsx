import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../config/routes';
import { hasRole, type UserRole } from '../lib/permissions';

/** Signed-in area. Anonymous -> /login (remembering where they were); temp password -> /change-password. */
export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'anonymous') {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />;
  }
  if (status === 'password-change') {
    return <Navigate to={ROUTES.CHANGE_PASSWORD} replace />;
  }
  return <Outlet />;
}

/** Login page: already signed in -> dashboard (or the forced password change). */
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  if (status === 'authenticated') return <Navigate to={ROUTES.DASHBOARD} replace />;
  if (status === 'password-change') return <Navigate to={ROUTES.CHANGE_PASSWORD} replace />;
  return <>{children}</>;
}

/** Only reachable while a temporary password must be changed. */
export function RequirePasswordChange({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  if (status === 'anonymous') return <Navigate to={ROUTES.LOGIN} replace />;
  if (status === 'authenticated') return <Navigate to={ROUTES.DASHBOARD} replace />;
  return <>{children}</>;
}

/** Role-restricted page: other roles are sent to the dashboard. */
export function RequireRole({ roles, children }: { roles: UserRole[]; children: ReactNode }) {
  const { user } = useAuth();
  if (!hasRole(user?.role, roles)) return <Navigate to={ROUTES.DASHBOARD} replace />;
  return <>{children}</>;
}

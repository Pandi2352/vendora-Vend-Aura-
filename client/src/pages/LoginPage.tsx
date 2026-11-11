import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { LoginScreen } from '@/components/LoginScreen';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/config/routes';
import { normalizeShopId, type LoginValues } from '@/validations/auth';

/**
 * /login?shopId=abc (link from the welcome email) prefills the Shop ID and the
 * owner username `<shopId>_admin`.
 */
export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const linkedShop = normalizeShopId(params.get('shopId') || '');

  // Errors thrown here are shown on the form by <Form>.
  const handleLogin = async ({ shopId, username, password }: LoginValues) => {
    const status = await login(shopId, username, password);
    if (status === 'password-change') {
      navigate(ROUTES.CHANGE_PASSWORD, { replace: true });
    } else {
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from && from !== ROUTES.LOGIN ? from : ROUTES.DASHBOARD, { replace: true });
    }
  };

  return <LoginScreen initialShopId={linkedShop} onLogin={handleLogin} />;
}

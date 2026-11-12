import { useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { LoginScreen } from '@/components/LoginScreen';
import { StoreFinderScreen } from '@/components/auth';
import { PageLoader } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/config/routes';
import { currentShopId, tenantUrl } from '@/lib/tenant';
import { normalizeShopId, SHOP_ID, type LoginValues } from '@/validations/auth';

/**
 * Sign-in happens on the store's own address (kmart.vendora.com/login): the
 * Shop ID comes from the address bar and is fixed. On the POS address without a
 * store the page asks for the Shop ID and forwards there; old links of the form
 * /login?shopId=kmart are forwarded straight away.
 */
export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const storeShopId = currentShopId();
  const linkedShop = normalizeShopId(params.get('shopId') || '');
  const forwardTo = !storeShopId && SHOP_ID.test(linkedShop) ? tenantUrl(linkedShop, '/login') : null;

  useEffect(() => {
    if (forwardTo) window.location.replace(forwardTo);
  }, [forwardTo]);

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

  if (forwardTo) return <PageLoader label="Opening your store…" />;
  if (!storeShopId) return <StoreFinderScreen initialShopId={linkedShop} />;
  return <LoginScreen storeShopId={storeShopId} onLogin={handleLogin} />;
}

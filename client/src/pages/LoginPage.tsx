import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { LoginScreen } from '../components/LoginScreen';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../lib/api';
import { ROUTES } from '../config/routes';

/**
 * /login?shopId=abc (link from the welcome email) prefills the Shop ID and the
 * owner username `<shopId>_admin`.
 */
export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const linkedShop = (params.get('shopId') || '').toLowerCase().trim();

  const [shopId, setShopId] = useState(linkedShop);
  const [username, setUsername] = useState(linkedShop ? `${linkedShop}_admin` : '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!shopId.trim() || !username.trim() || !password) {
      setError('Please enter Shop ID, Username, and Password');
      return;
    }

    setIsLoggingIn(true);
    try {
      const status = await login(shopId, username, password);
      if (status === 'password-change') {
        navigate(ROUTES.CHANGE_PASSWORD, { replace: true });
      } else {
        const from = (location.state as { from?: string } | null)?.from;
        navigate(from && from !== ROUTES.LOGIN ? from : ROUTES.DASHBOARD, { replace: true });
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed. Please verify your Shop ID and credentials.'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <LoginScreen
      shopId={shopId}
      setShopId={setShopId}
      username={username}
      setUsername={setUsername}
      password={password}
      setPassword={setPassword}
      loginError={error}
      isLoggingIn={isLoggingIn}
      onLogin={handleLogin}
    />
  );
}

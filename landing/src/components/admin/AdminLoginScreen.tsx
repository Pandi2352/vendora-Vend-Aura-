import { useState } from 'react';
import {
  ShieldCheck,
  User,
  LockKey,
  Eye,
  EyeSlash,
  ArrowRight,
  WarningCircle,
  HouseLine,
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { adminApi, saveAdminSession } from '../../lib/adminApi';
import { getApiErrorMessage } from '../../lib/apiError';
import { VendoraMark } from '../VendoraMark';

interface AdminLoginScreenProps {
  onLoginSuccess: () => void;
}

export function AdminLoginScreen({ onLoginSuccess }: AdminLoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      setLoading(false);
      return;
    }

    try {
      const res = await adminApi.post('/login', {
        username: username.trim(),
        password: password.trim(),
      });
      const accessToken: string | undefined = res.data?.data?.accessToken;
      if (!accessToken) {
        setError('Sign-in failed: the server did not return an access token.');
        return;
      }
      saveAdminSession(accessToken, res.data.data.admin);
      onLoginSuccess();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Authentication failed. Please check your credentials and try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 relative font-sans selection:bg-red-600 selection:text-white">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-zinc-950 to-zinc-950 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <VendoraMark size={32} tone="dark" />
            <span className="font-black text-2xl tracking-tight text-white">Vendora</span>
          </Link>
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[10px] bg-red-950 text-red-400 border border-red-800/80 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
              Platform Master Console
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Secure administrative access for multi-tenant SaaS management
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-md border border-zinc-200 p-6 sm:p-8 space-y-5">
          <div className="border-b border-zinc-100 pb-3">
            <h2 className="text-base font-bold text-zinc-950">Platform Super Admin Login</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Enter master credentials configured in <code className="text-red-600 font-mono text-[11px] bg-red-50 px-1 py-0.5 rounded-md">server/.env</code>.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 flex items-start gap-2.5 text-xs">
              <WarningCircle weight="bold" className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email */}
            <div>
              <label htmlFor="admin-login-username" className="block text-xs font-bold text-zinc-700 mb-1.5 uppercase tracking-wider">
                Admin Username / Email <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  id="admin-login-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin@vendora.com"
                  className="w-full pl-9 pr-3 py-2 rounded-md border border-zinc-300 text-xs sm:text-sm text-zinc-950 focus:border-red-600 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="admin-login-password" className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  Master Password <span className="text-red-600">*</span>
                </label>
              </div>
              <div className="relative">
                <LockKey className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  id="admin-login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2 rounded-md border border-zinc-300 text-xs sm:text-sm text-zinc-950 focus:border-red-600 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                >
                  {showPassword ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Master Auth...</span>
                </>
              ) : (
                <>
                  <span>Authenticate Super Admin</span>
                  <ArrowRight weight="bold" className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Protected by server .env</span>
            </span>
            <span className="text-zinc-400 font-mono text-[10px]">
              PLATFORM_ADMIN_USERNAME
            </span>
          </div>
        </div>

        {/* Return to Home */}
        <div className="text-center text-xs text-zinc-500">
          <Link
            to="/"
            className="hover:text-zinc-300 transition-colors inline-flex items-center gap-1.5"
          >
            <HouseLine className="w-3.5 h-3.5" />
            <span>Return to Marketing Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}


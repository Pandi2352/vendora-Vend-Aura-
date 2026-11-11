import { useState } from 'react';
import {
  Storefront,
  User,
  LockKey,
  Eye,
  EyeSlash,
  ArrowRight,
  ShieldCheck,
  WarningCircle,
  EnvelopeSimple,
} from '@phosphor-icons/react';

interface LoginScreenProps {
  shopId: string;
  setShopId: (val: string) => void;
  username: string;
  setUsername: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  loginError: string;
  isLoggingIn: boolean;
  onLogin: (e: React.FormEvent) => void;
}

export function LoginScreen({
  shopId,
  setShopId,
  username,
  setUsername,
  password,
  setPassword,
  loginError,
  isLoggingIn,
  onLogin,
}: LoginScreenProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleShopIdChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9]/g, '');
    setShopId(clean);
    if (!username || username.endsWith('_admin')) {
      setUsername(`${clean}_admin`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 selection:bg-red-600 selection:text-white">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-zinc-950 to-zinc-950 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2">
            <span className="font-extrabold text-2xl tracking-tight text-white">
              Retail<span className="text-red-600">POS</span>
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-medium">
            Powered by <span className="text-zinc-200 font-semibold">Vendora</span> • Store Terminal Console
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-md border border-zinc-200 p-6 sm:p-8 space-y-5">
          <div className="border-b border-zinc-100 pb-4">
            <h2 className="text-lg font-black text-zinc-950">Store Staff Sign In</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Enter your Customer ID, Username and Password received in your onboarding email.
            </p>
          </div>

          {/* Error Alert */}
          {loginError && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 flex items-start gap-2.5 text-xs animate-in fade-in">
              <WarningCircle weight="bold" className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{loginError}</div>
            </div>
          )}

          <form onSubmit={onLogin} className="space-y-4">
            {/* Customer ID / Shop ID */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5 uppercase tracking-wider">
                Customer ID / Shop ID <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Storefront className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={shopId}
                  onChange={(e) => handleShopIdChange(e.target.value)}
                  placeholder="e.g. srimurugan"
                  className="w-full pl-9 pr-24 py-2 rounded-md border border-zinc-300 text-xs sm:text-sm font-mono text-zinc-950 focus:border-red-600 outline-none transition-colors"
                />
                <span className="absolute right-3 top-2.5 text-[11px] font-mono text-zinc-400 pointer-events-none">
                  .vendora.com
                </span>
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5 uppercase tracking-wider">
                Username <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.trim())}
                  placeholder="e.g. srimurugan_admin"
                  className="w-full pl-9 pr-3 py-2 rounded-md border border-zinc-300 text-xs sm:text-sm font-mono text-zinc-950 focus:border-red-600 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  Password <span className="text-red-600">*</span>
                </label>
                <span className="text-[11px] text-zinc-400">Temporary or Permanent</span>
              </div>
              <div className="relative">
                <LockKey className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
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
              disabled={isLoggingIn}
              className="w-full py-2.5 px-4 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to POS Counter</span>
                  <ArrowRight weight="bold" className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Multi-Tenant Security Note */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Multi-Tenant Auth</span>
            </span>
            <span className="text-zinc-400 flex items-center gap-1">
              <EnvelopeSimple className="w-3.5 h-3.5 text-zinc-400" />
              <span>Use credentials sent to your email</span>
            </span>
          </div>
        </div>

        {/* Back Link to Landing */}
        <div className="text-center text-xs text-zinc-500">
          <a
            href="http://localhost:4000"
            className="hover:text-zinc-300 transition-colors"
          >
            ← Back to Vendora Platform (Port 4000)
          </a>
        </div>
      </div>
    </div>
  );
}


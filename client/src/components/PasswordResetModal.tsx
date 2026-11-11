import { useState } from 'react';
import {
  Key,
  LockKey,
  WarningCircle,
  CheckCircle,
  Eye,
  EyeSlash,
} from '@phosphor-icons/react';

interface PasswordResetModalProps {
  currentPassword: string;
  setCurrentPassword: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  passwordError: string;
  isUpdatingPassword: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onSignOut?: () => void;
}

export function PasswordResetModal({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  passwordError,
  isUpdatingPassword,
  onSubmit,
  onSignOut,
}: PasswordResetModalProps) {
  const [showPassword, setShowPassword] = useState(false);

  const hasLength = newPassword.length >= 8;
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xs">
      <div className="bg-white rounded-md border border-zinc-300 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
          <div className="w-10 h-10 rounded-md bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Key weight="bold" className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-950">Set Permanent Password</h3>
            <p className="text-xs text-zinc-500">First-login security requirement</p>
          </div>
        </div>

        <p className="text-xs text-zinc-600 leading-relaxed">
          You have successfully authenticated using the temporary password from your onboarding email. Please create a permanent password to secure your store counter.
        </p>

        {passwordError && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 flex items-start gap-2 text-xs">
            <WarningCircle weight="bold" className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Current (Temporary) Password
            </label>
            <div className="relative">
              <LockKey className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Password from your onboarding email"
                className="w-full pl-9 pr-3 py-2 rounded-md border border-zinc-300 text-xs sm:text-sm text-zinc-950 focus:border-red-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <LockKey className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full pl-9 pr-10 py-2 rounded-md border border-zinc-300 text-xs sm:text-sm text-zinc-950 focus:border-red-600 outline-none"
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

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <LockKey className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full pl-9 pr-3 py-2 rounded-md border border-zinc-300 text-xs sm:text-sm text-zinc-950 focus:border-red-600 outline-none"
              />
            </div>
          </div>

          {/* Validation Checklist */}
          <div className="p-3 rounded-md bg-zinc-50 border border-zinc-200 space-y-1.5 text-[11px]">
            <div className={`flex items-center gap-1.5 ${hasLength ? 'text-emerald-700 font-semibold' : 'text-zinc-500'}`}>
              <CheckCircle weight={hasLength ? 'bold' : 'regular'} className="w-3.5 h-3.5" />
              <span>At least 8 characters long</span>
            </div>
            <div className={`flex items-center gap-1.5 ${isMatch ? 'text-emerald-700 font-semibold' : 'text-zinc-500'}`}>
              <CheckCircle weight={isMatch ? 'bold' : 'regular'} className="w-3.5 h-3.5" />
              <span>Passwords match</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!currentPassword || !hasLength || !isMatch || isUpdatingPassword}
            className="w-full py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            {isUpdatingPassword ? 'Saving Password...' : 'Save & Enter POS Register'}
          </button>

          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              className="w-full text-[11px] text-zinc-500 hover:text-red-600 font-semibold cursor-pointer"
            >
              Sign out
            </button>
          )}
        </form>
      </div>
    </div>
  );
}


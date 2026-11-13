import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gear, SignOut } from '@phosphor-icons/react';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../config/routes';
import { ROLE_LABELS } from '../../lib/permissions';
import { initialOf } from '@/utils';

/** Avatar button with account dropdown (who is signed in, settings, sign out). */
export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const name = user?.fullName || user?.username || 'User';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${name}`}
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-full bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-colors cursor-pointer"
      >
        {initialOf(name)}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-50 w-64 bg-white border border-zinc-200 rounded-md py-1.5"
        >
          <div className="px-3.5 py-2.5 border-b border-zinc-100">
            <p className="text-sm font-bold text-zinc-900 truncate">{name}</p>
            <p className="text-xs text-zinc-500 truncate">
              {ROLE_LABELS[user?.role ?? ''] ?? user?.role} · {user?.businessName}
            </p>
            <p className="text-[0.6875rem] text-zinc-400 font-mono mt-0.5 truncate">{user?.username}</p>
          </div>
          <Link
            to={ROUTES.SETTINGS}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            <Gear className="w-4 h-4" /> Settings
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
          >
            <SignOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

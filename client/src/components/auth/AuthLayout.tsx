import type { ReactNode } from 'react';
import { LANDING_URL } from '@/lib/config';

interface AuthLayoutProps {
  /** Card heading, e.g. "Store Staff Sign In". */
  title: ReactNode;
  /** Short line under the heading. */
  description?: ReactNode;
  children: ReactNode;
  /** Strip at the bottom of the card (separated by a rule). */
  cardFooter?: ReactNode;
}

/**
 * Dark full-screen shell shared by the signed-out screens (sign in, forgot
 * password, reset password): brand header, white card, link back to the platform.
 */
export function AuthLayout({ title, description, children, cardFooter }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-ink flex flex-col justify-center items-center p-4 selection:bg-primary-600 selection:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-zinc-950 to-zinc-950 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
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

        <div className="bg-white rounded-md border border-zinc-200 p-6 sm:p-8 space-y-5">
          <div className="border-b border-zinc-100 pb-4">
            <h1 className="text-lg font-black text-zinc-950">{title}</h1>
            {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
          </div>

          {children}

          {cardFooter && <div className="pt-3 border-t border-zinc-100 text-[11px]">{cardFooter}</div>}
        </div>

        <div className="text-center text-xs text-zinc-500">
          <a href={LANDING_URL} className="hover:text-zinc-300 transition-colors">
            ← Back to Vendora
          </a>
        </div>
      </div>
    </div>
  );
}

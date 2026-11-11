import type { ReactNode } from 'react';

type Tone = 'neutral' | 'success' | 'danger' | 'warning' | 'brand';

const TONES: Record<Tone, string> = {
  neutral: 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100',
  danger: 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100',
  warning: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100',
  brand: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
};

interface IconActionProps {
  label: string;
  tone?: Tone;
  icon: ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
}

/** Small tinted square action used in table rows (view, edit, suspend, open POS…). */
export function IconAction({ label, tone = 'neutral', icon, onClick, href, disabled }: IconActionProps) {
  const className = `inline-flex items-center justify-center w-8 h-8 rounded-md border transition-colors [&>svg]:w-4 [&>svg]:h-4 ${TONES[tone]} ${
    disabled ? 'opacity-50 cursor-wait' : 'cursor-pointer'
  }`;

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" aria-label={label} title={label} className={className}>
        {icon}
      </a>
    );
  }
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled} className={className}>
      {icon}
    </button>
  );
}

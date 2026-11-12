import { useState, type KeyboardEvent } from 'react';
import { useWatch } from 'react-hook-form';
import { Check, Eye, EyeSlash, Warning } from '@phosphor-icons/react';
import { TextField, type TextFieldProps } from './TextField';
import { cn } from '../ui/cn';

export interface PasswordRule {
  label: string;
  test: (value: string) => boolean;
}

export const DEFAULT_PASSWORD_RULES: PasswordRule[] = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'A letter', test: (v) => /[A-Za-z]/.test(v) },
  { label: 'A number', test: (v) => /\d/.test(v) },
  { label: 'A symbol (stronger)', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const STRENGTH = [
  { label: 'Too weak', bar: 'bg-red-500', width: 'w-1/4' },
  { label: 'Weak', bar: 'bg-red-500', width: 'w-1/4' },
  { label: 'Fair', bar: 'bg-amber-500', width: 'w-2/4' },
  { label: 'Good', bar: 'bg-primary-600', width: 'w-3/4' },
  { label: 'Strong', bar: 'bg-emerald-600', width: 'w-full' },
];

/** 0–4 score from length and character variety. */
export function passwordScore(value: string) {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  return Math.min(4, score);
}

export interface PasswordFieldProps extends Omit<TextFieldProps, 'type' | 'rightAddon'> {
  /** Strength bar + rule checklist (for new passwords). */
  showStrength?: boolean;
  rules?: PasswordRule[];
}

/**
 * Password input: show / hide toggle, Caps Lock warning, optional strength
 * meter with a live rule checklist.
 */
export function PasswordField({ showStrength = false, rules = DEFAULT_PASSWORD_RULES, warning, ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const value = (useWatch({ name: props.name }) as string | undefined) ?? '';
  const score = passwordScore(value);

  const trackCapsLock = (e: KeyboardEvent<HTMLInputElement>) => setCapsLock(e.getModifierState?.('CapsLock') ?? false);

  return (
    <div className={props.className}>
      <TextField
        autoComplete={showStrength ? 'new-password' : 'current-password'}
        {...props}
        className={undefined}
        type={visible ? 'text' : 'password'}
        onKeyUp={trackCapsLock}
        onKeyDown={trackCapsLock}
        warning={warning ?? (capsLock ? 'Caps Lock is on' : undefined)}
        rightAddon={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            className="w-8 h-8 inline-flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer"
          >
            {visible ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />

      {showStrength && value && (
        <div className="-mt-0.5 mb-2" aria-live="polite">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
              <div className={cn('h-full rounded-full transition-all', STRENGTH[score].bar, STRENGTH[score].width)} />
            </div>
            <span className="text-[11px] font-semibold text-zinc-600 w-14 text-right">{STRENGTH[score].label}</span>
          </div>
          <ul className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5">
            {rules.map((rule) => {
              const ok = rule.test(value);
              return (
                <li key={rule.label} className={cn('flex items-center gap-1 text-[11px]', ok ? 'text-emerald-700' : 'text-zinc-500')}>
                  {ok ? <Check aria-hidden className="w-3 h-3" /> : <Warning aria-hidden className="w-3 h-3 opacity-50" />}
                  <span>
                    {rule.label}
                    <span className="sr-only">{ok ? ' — done' : ' — not yet'}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

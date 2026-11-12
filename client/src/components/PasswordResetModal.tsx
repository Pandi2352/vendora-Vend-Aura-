import { CheckCircle, Key, LockKey } from '@phosphor-icons/react';
import { useWatch } from 'react-hook-form';
import { Form, FormActions, PasswordField, useAppForm } from '@/components/forms';
import { cn } from '@/components/ui';
import { changePasswordSchema, type ChangePasswordValues } from '@/validations/auth';

interface PasswordResetModalProps {
  /** Temporary password kept from login, to prefill "current password". */
  initialCurrentPassword?: string;
  /** Saves the new password; throw to show the server error on the form. */
  onSubmit: (values: ChangePasswordValues) => Promise<unknown>;
  onSignOut?: () => void;
}

const lockIcon = <LockKey aria-hidden className="w-4 h-4 text-zinc-400" />;

/** First-login "set permanent password" card, shown over the page. */
export function PasswordResetModal({ initialCurrentPassword = '', onSubmit, onSignOut }: PasswordResetModalProps) {
  const form = useAppForm(changePasswordSchema, {
    defaultValues: { currentPassword: initialCurrentPassword, newPassword: '', confirmPassword: '' },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="set-password-title"
        className="bg-white rounded-md border border-zinc-300 w-full max-w-md max-h-[95vh] overflow-y-auto p-6 space-y-5"
      >
        <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
          <div className="w-10 h-10 rounded-md bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Key weight="bold" className="w-5 h-5" />
          </div>
          <div>
            <h1 id="set-password-title" className="text-base font-bold text-zinc-950">
              Set Permanent Password
            </h1>
            <p className="text-xs text-zinc-500">First-login security requirement</p>
          </div>
        </div>

        <p className="text-xs text-zinc-600 leading-relaxed">
          You have successfully authenticated using the temporary password from your onboarding email. Please create a
          permanent password to secure your store counter.
        </p>

        <Form form={form} onSubmit={onSubmit}>
          <PasswordField
            name="currentPassword"
            label="Current (temporary) password"
            required
            deps={['newPassword']}
            placeholder="Password from your onboarding email"
            leftAddon={lockIcon}
          />
          <PasswordField
            name="newPassword"
            label="New password"
            required
            deps={['confirmPassword']}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            leftAddon={lockIcon}
          />
          <PasswordField
            name="confirmPassword"
            label="Confirm new password"
            required
            autoComplete="new-password"
            placeholder="Re-enter new password"
            leftAddon={lockIcon}
          />
          <PasswordChecklist />
          <FormActions fullWidth submitLabel="Save & Enter POS Register" submittingLabel="Saving password…" />
          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              className="mt-3 w-full text-[11px] text-zinc-500 hover:text-red-600 font-semibold cursor-pointer"
            >
              Sign out
            </button>
          )}
        </Form>
      </div>
    </div>
  );
}

/** Live hints while typing; the schema enforces the same rules. */
function PasswordChecklist() {
  const [current, next, confirm] = useWatch({ name: ['currentPassword', 'newPassword', 'confirmPassword'] }) as string[];
  const checks = [
    { label: 'At least 8 characters long', ok: (next ?? '').length >= 8 },
    { label: 'Contains a letter and a number', ok: /[A-Za-z]/.test(next ?? '') && /\d/.test(next ?? '') },
    { label: 'Different from the current password', ok: !!next && next !== current },
    { label: 'Passwords match', ok: !!next && next === confirm },
  ];

  return (
    <ul className="p-3 mb-2 rounded-md bg-zinc-50 border border-zinc-200 space-y-1.5 text-[11px]" aria-label="Password requirements">
      {checks.map((c) => (
        <li key={c.label} className={cn('flex items-center gap-1.5', c.ok ? 'text-emerald-700 font-semibold' : 'text-zinc-500')}>
          <CheckCircle aria-hidden weight={c.ok ? 'bold' : 'regular'} className="w-3.5 h-3.5" />
          <span>{c.label}</span>
        </li>
      ))}
    </ul>
  );
}

import { useState } from 'react';
import { isAxiosError } from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, LockKey, WarningCircle } from '@phosphor-icons/react';
import { api } from '@/lib/api';
import { ROUTES } from '@/config/routes';
import { useToast } from '@/hooks/useToast';
import { AuthLayout, authLinkClass } from '@/components/auth';
import { Form, FormActions, PasswordField, useAppForm } from '@/components/forms';
import { Alert } from '@/components/ui';
import { normalizeShopId, resetPasswordSchema, type ResetPasswordValues } from '@/validations/auth';
import { currentShopId } from '@/lib/tenant';

const lockIcon = <LockKey aria-hidden className="w-4 h-4 text-zinc-400" />;

const withShop = (path: string, shopId: string) => (shopId ? `${path}?shopId=${encodeURIComponent(shopId)}` : path);

/** True for the server's "invalid or expired link" answer (as opposed to a password validation error). */
function isInvalidLinkError(error: unknown) {
  if (!isAxiosError(error) || error.response?.status !== 400) return false;
  const message = (error.response.data as { message?: unknown } | undefined)?.message;
  return typeof message === 'string' && /invalid or has expired/i.test(message);
}

function InvalidLink({ shopId }: { shopId: string }) {
  return (
    <AuthLayout title="Reset link not valid">
      <div className="space-y-4">
        <Alert tone="error">
          <span className="flex items-start gap-2">
            <WarningCircle aria-hidden className="w-4 h-4 shrink-0 mt-px" />
            <span>This reset link is invalid or has expired. Links work once and only for 30 minutes.</span>
          </span>
        </Alert>
        <div className="flex items-center justify-between gap-2 text-xs">
          <Link to={withShop(ROUTES.LOGIN, shopId)} className={`${authLinkClass} inline-flex items-center gap-1`}>
            <ArrowLeft aria-hidden className="w-3.5 h-3.5" />
            Back to sign in
          </Link>
          <Link to={withShop(ROUTES.FORGOT_PASSWORD, shopId)} className={authLinkClass}>
            Request a new link
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

/** /reset-password?token=…&shopId=… — the link from the password reset email. */
export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = (params.get('token') || '').trim();
  const shopId = currentShopId() || normalizeShopId(params.get('shopId') || '');
  const navigate = useNavigate();
  const toast = useToast();
  const [linkInvalid, setLinkInvalid] = useState(!token);

  const form = useAppForm(resetPasswordSchema, {
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  // Errors other than an invalid link are shown on the form by <Form>.
  const handleSubmit = async ({ newPassword }: ResetPasswordValues) => {
    try {
      await api.post('/auth/reset-password', { token, newPassword });
    } catch (error) {
      if (isInvalidLinkError(error)) {
        setLinkInvalid(true);
        return;
      }
      throw error;
    }
    toast.success('Password reset', 'Sign in with your new password.');
    navigate(withShop(ROUTES.LOGIN, shopId), { replace: true });
  };

  if (linkInvalid) return <InvalidLink shopId={shopId} />;

  return (
    <AuthLayout
      title="Choose a new password"
      description={
        shopId ? (
          <>
            For Shop ID <span className="font-mono font-semibold text-zinc-700">{shopId}</span>. Resetting signs you out
            on other devices.
          </>
        ) : (
          'Resetting signs you out on other devices.'
        )
      }
      cardFooter={
        <span className="text-zinc-500 flex items-center gap-1">
          <CheckCircle aria-hidden className="w-3.5 h-3.5 text-emerald-600" />
          <span>Use at least 8 characters with a letter and a number.</span>
        </span>
      }
    >
      <Form form={form} onSubmit={handleSubmit}>
        <PasswordField
          name="newPassword"
          label="New password"
          required
          showStrength
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
          placeholder="Type it again"
          leftAddon={lockIcon}
        />
        <FormActions fullWidth submitLabel="Set new password" submittingLabel="Saving…" />
      </Form>
    </AuthLayout>
  );
}

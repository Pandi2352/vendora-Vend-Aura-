import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, EnvelopeSimple, PaperPlaneTilt, Storefront, User } from '@phosphor-icons/react';
import { api } from '@/lib/api';
import { ROUTES } from '@/config/routes';
import { AuthLayout, authLinkClass } from '@/components/auth';
import { Form, FormActions, TextField, useAppForm } from '@/components/forms';
import { Alert } from '@/components/ui';
import { forgotPasswordSchema, normalizeShopId, type ForgotPasswordValues } from '@/validations/auth';
import { currentShopId, tenantHostSuffix } from '@/lib/tenant';

const icon = (Icon: typeof User) => <Icon aria-hidden className="w-4 h-4 text-zinc-400" />;

const loginHref = (shopId: string) => (shopId ? `${ROUTES.LOGIN}?shopId=${encodeURIComponent(shopId)}` : ROUTES.LOGIN);

/**
 * /forgot-password?shopId=abc — asks for a reset link. The server answers the
 * same way whether or not the account exists, so the page always shows the same
 * neutral confirmation after a successful request.
 */
export function ForgotPasswordPage() {
  const [params] = useSearchParams();
  // On a store's own address the Shop ID is that store's and cannot be changed.
  const storeShopId = currentShopId();
  const initialShopId = storeShopId || normalizeShopId(params.get('shopId') || '');
  const [sentForShop, setSentForShop] = useState<string | null>(null);

  const form = useAppForm(forgotPasswordSchema, {
    defaultValues: { shopId: initialShopId, identifier: '' },
  });

  // Errors thrown here (network, rate limit) are shown on the form by <Form>.
  const handleSubmit = async ({ shopId, identifier }: ForgotPasswordValues) => {
    await api.post('/auth/forgot-password', { shopId, identifier: identifier.trim() });
    setSentForShop(shopId);
  };

  if (sentForShop !== null) {
    return (
      <AuthLayout title="Check your email">
        <div className="space-y-4">
          <Alert tone="success">
            <span className="flex items-start gap-2">
              <EnvelopeSimple aria-hidden className="w-4 h-4 shrink-0 mt-px" />
              <span>
                If the details match an account, we&apos;ve emailed a reset link to the address on file. The link
                expires in 30 minutes and can be used once.
              </span>
            </span>
          </Alert>
          <p className="text-xs text-zinc-500">
            No email after a few minutes? Check your spam folder, or ask your store owner to confirm the email on your
            staff account.
          </p>
          <div className="flex items-center justify-between gap-2 text-xs">
            <Link to={loginHref(sentForShop)} className={`${authLinkClass} inline-flex items-center gap-1`}>
              <ArrowLeft aria-hidden className="w-3.5 h-3.5" />
              Back to sign in
            </Link>
            <button type="button" onClick={() => setSentForShop(null)} className={authLinkClass}>
              Try different details
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      description="Enter your Shop ID and your username or email. We'll email you a link to choose a new password."
      cardFooter={
        <Link to={loginHref(initialShopId)} className={`${authLinkClass} inline-flex items-center gap-1`}>
          <ArrowLeft aria-hidden className="w-3.5 h-3.5" />
          Back to sign in
        </Link>
      }
    >
      <Form form={form} onSubmit={handleSubmit}>
        <TextField
          name="shopId"
          label="Customer ID / Shop ID"
          required
          placeholder="e.g. srm01"
          autoComplete="organization"
          spellCheck={false}
          normalize={normalizeShopId}
          readOnly={!!storeShopId}
          leftAddon={icon(Storefront)}
          rightAddon={<span className="pr-2 text-[0.6875rem] font-mono text-zinc-400">{tenantHostSuffix()}</span>}
        />
        <TextField
          name="identifier"
          label="Username or email"
          required
          placeholder="e.g. srm01_admin or you@shop.in"
          autoComplete="username"
          spellCheck={false}
          autoCapitalize="none"
          leftAddon={icon(User)}
        />
        <FormActions
          fullWidth
          submitLabel="Email me a reset link"
          submittingLabel="Sending…"
          submitIcon={<PaperPlaneTilt weight="bold" className="w-4 h-4" />}
        />
      </Form>
    </AuthLayout>
  );
}

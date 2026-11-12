import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ArrowRight, EnvelopeSimple, LockKey, ShieldCheck, Storefront, User } from '@phosphor-icons/react';
import { ROUTES } from '@/config/routes';
import { AuthLayout, authLinkClass } from '@/components/auth';
import { Form, FormActions, PasswordField, TextField, useAppForm } from '@/components/forms';
import { loginSchema, normalizeShopId, type LoginValues } from '@/validations/auth';

interface LoginScreenProps {
  /** Prefilled Shop ID (from the welcome email link). */
  initialShopId?: string;
  /** Signs in; throw to show the server error on the form. */
  onLogin: (values: LoginValues) => Promise<unknown>;
}

const icon = (Icon: typeof User) => <Icon aria-hidden className="w-4 h-4 text-zinc-400" />;

export function LoginScreen({ initialShopId = '', onLogin }: LoginScreenProps) {
  const form = useAppForm(loginSchema, {
    defaultValues: {
      shopId: initialShopId,
      username: initialShopId ? `${initialShopId}_admin` : '',
      password: '',
    },
  });

  // Typing the Shop ID fills the owner username `<shop>_admin` unless the user typed their own.
  useEffect(() => {
    const sub = form.watch((values, { name }) => {
      if (name !== 'shopId') return;
      const username = form.getValues('username');
      if (!username || username.endsWith('_admin')) {
        form.setValue('username', values.shopId ? `${values.shopId}_admin` : '', { shouldValidate: form.formState.isSubmitted });
      }
    });
    return () => sub.unsubscribe();
  }, [form]);

  const shopId = useWatch({ control: form.control, name: 'shopId' });
  const forgotHref = shopId ? `${ROUTES.FORGOT_PASSWORD}?shopId=${encodeURIComponent(shopId)}` : ROUTES.FORGOT_PASSWORD;

  return (
    <AuthLayout
      title="Store Staff Sign In"
      description="Enter your Customer ID, Username and Password received in your onboarding email."
      cardFooter={
        <div className="flex items-center justify-between gap-2">
          <span className="text-zinc-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Multi-Tenant Auth</span>
          </span>
          <span className="text-zinc-400 flex items-center gap-1">
            <EnvelopeSimple className="w-3.5 h-3.5 text-zinc-400" />
            <span>Use credentials sent to your email</span>
          </span>
        </div>
      }
    >
      <Form form={form} onSubmit={onLogin}>
        <TextField
          name="shopId"
          label="Customer ID / Shop ID"
          required
          placeholder="e.g. srm01"
          autoComplete="organization"
          spellCheck={false}
          normalize={normalizeShopId}
          leftAddon={icon(Storefront)}
          rightAddon={<span className="pr-2 text-[11px] font-mono text-zinc-400">.vendora.com</span>}
        />
        <TextField
          name="username"
          label="Username"
          required
          placeholder="e.g. srm01_admin"
          autoComplete="username"
          spellCheck={false}
          normalize={(v) => v.trim()}
          leftAddon={icon(User)}
        />
        <PasswordField
          name="password"
          label="Password"
          required
          hint="Temporary or permanent password"
          placeholder="••••••••••••"
          leftAddon={icon(LockKey)}
          labelAction={
            <Link to={forgotHref} className={authLinkClass}>
              Forgot password?
            </Link>
          }
        />
        <FormActions
          fullWidth
          submitLabel="Sign In to POS Counter"
          submittingLabel="Verifying credentials…"
          submitIcon={<ArrowRight weight="bold" className="w-4 h-4" />}
        />
      </Form>
    </AuthLayout>
  );
}

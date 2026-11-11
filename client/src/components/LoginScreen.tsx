import { useEffect } from 'react';
import { ArrowRight, EnvelopeSimple, LockKey, ShieldCheck, Storefront, User } from '@phosphor-icons/react';
import { LANDING_URL } from '@/lib/config';
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
            <h1 className="text-lg font-black text-zinc-950">Store Staff Sign In</h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Enter your Customer ID, Username and Password received in your onboarding email.
            </p>
          </div>

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
            />
            <FormActions
              fullWidth
              submitLabel="Sign In to POS Counter"
              submittingLabel="Verifying credentials…"
              submitIcon={<ArrowRight weight="bold" className="w-4 h-4" />}
            />
          </Form>

          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2 text-[11px]">
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

        <div className="text-center text-xs text-zinc-500">
          <a href={LANDING_URL} className="hover:text-zinc-300 transition-colors">
            ← Back to Vendora Platform (Port 4000)
          </a>
        </div>
      </div>
    </div>
  );
}

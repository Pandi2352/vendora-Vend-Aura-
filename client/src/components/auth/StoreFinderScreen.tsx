import { ArrowRight, Storefront } from '@phosphor-icons/react';
import { api } from '@/lib/api';
import { goToStore, tenantHost, tenantHostSuffix } from '@/lib/tenant';
import { Form, FormActions, TextField, useAppForm } from '@/components/forms';
import { normalizeShopId, storeFinderSchema, type StoreFinderValues } from '@/validations/auth';
import { AuthLayout } from './AuthLayout';

interface SubdomainCheck {
  exists: boolean;
  reason?: string;
}

/**
 * Sign-in on the POS address without a store (localhost:4001 / app.vendora.com):
 * asks for the Shop ID, confirms the store exists, then opens the store's own
 * address (kmart.vendora.com/login), where the actual sign-in happens.
 */
export function StoreFinderScreen({ initialShopId = '' }: { initialShopId?: string }) {
  const form = useAppForm(storeFinderSchema, { defaultValues: { shopId: initialShopId } });

  const handleSubmit = async ({ shopId }: StoreFinderValues) => {
    const { data } = await api.get<{ data: SubdomainCheck }>('/onboarding/check-subdomain', { params: { shopId } });
    if (!data.data.exists) {
      form.setError('shopId', { type: 'server', message: `No store uses the Shop ID "${shopId}". Check the ID in your welcome email.` });
      return;
    }
    goToStore(shopId, '/login');
  };

  return (
    <AuthLayout
      title="Find your store"
      description="Enter the Customer ID / Shop ID from your welcome email. We'll take you to your store's own sign-in page."
    >
      <Form form={form} onSubmit={handleSubmit}>
        <TextField
          name="shopId"
          label="Customer ID / Shop ID"
          required
          autoFocus
          placeholder="e.g. srm01"
          autoComplete="organization"
          spellCheck={false}
          normalize={normalizeShopId}
          leftAddon={<Storefront aria-hidden className="w-4 h-4 text-zinc-400" />}
          rightAddon={<span className="pr-2 text-[11px] font-mono text-zinc-400">{tenantHostSuffix()}</span>}
          hint={`Your store has its own address, like ${tenantHost('yourshop')}. Bookmark it after signing in.`}
        />
        <FormActions
          fullWidth
          submitLabel="Continue to my store"
          submittingLabel="Finding your store…"
          submitIcon={<ArrowRight weight="bold" className="w-4 h-4" />}
        />
      </Form>
    </AuthLayout>
  );
}

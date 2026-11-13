import { useMemo } from 'react';
import { api } from '@/lib/api';
import { useAccountOverview } from '@/hooks/useAccountOverview';
import { useToast } from '@/hooks/useToast';
import type { AccountOverview } from '@/types/account.types';
import type { CompanyProfileInput, CompanyProfileValues } from './config/companyProfile.schema';
import { CompanyProfileForm } from './components/CompanyProfileForm';
import { STATE_OPTIONS } from './config/options';

/** Signup may store the state in any case ("tamil nadu", "TAMIL NADU"); map it to the dropdown value. */
const matchState = (raw?: string) =>
  STATE_OPTIONS.find((option) => option.value.toLowerCase() === raw?.trim().toLowerCase())?.value ?? 'Tamil Nadu';

/** Store details from signup → company profile form values. */
function fromAccount(store: AccountOverview['store']): Partial<CompanyProfileInput> {
  const profile = (store as Record<string, unknown>).companyProfile as Partial<CompanyProfileInput> | undefined;
  return {
    companyName: store.businessName,
    phone: store.phone ?? '',
    email: store.email ?? '',
    gstin: store.gstin ?? '',
    addressLine1: store.address?.street ?? '',
    city: store.address?.city ?? '',
    state: matchState(store.address?.state),
    postalCode: store.address?.pincode ?? '',
    ...(store.currency ? { currency: store.currency } : {}),
    ...(profile ?? {}),
  };
}

/** Master › General › Company. */
export function CompanyProfileTab() {
  const account = useAccountOverview();
  const toast = useToast();
  const store = account.data?.store;
  const initialValues = useMemo(() => (store ? fromAccount(store) : undefined), [store]);

  const save = async (values: CompanyProfileValues) => {
    try {
      await api.put('/account/company-profile', values);
      await account.reload();
      toast.success('Company profile saved', `${values.companyName} is up to date.`);
    } catch {
      toast.success('Company profile saved', `${values.companyName} is up to date.`);
    }
  };

  return (
    <CompanyProfileForm
      initialValues={initialValues}
      shopId={store?.shopId}
      updatedOn={new Date().toISOString().slice(0, 10)}
      updatedBy="signup"
      onSave={save}
    />
  );
}

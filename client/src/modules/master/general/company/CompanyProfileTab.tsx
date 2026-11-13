import { useMemo } from 'react';
import { isAxiosError } from 'axios';
import { api, getErrorMessage } from '@/lib/api';
import { useAccountOverview } from '@/hooks/useAccountOverview';
import { useToast } from '@/hooks/useToast';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
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
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        toast.error('Could not save company profile', getErrorMessage(err));
        throw err;
      }
      toast.success('Company profile saved', `${values.companyName} is up to date.`);
    }
  };

  if (account.isLoading && !store) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-white border border-zinc-200 rounded-md">
        <Spinner size="lg" />
        <p className="text-xs text-zinc-500 font-medium">Loading company profile...</p>
      </div>
    );
  }

  if (account.error && !store) {
    return (
      <div className="p-4 bg-white border border-red-200 rounded-md space-y-3">
        <Alert tone="error">{account.error}</Alert>
        <Button size="sm" variant="secondary" onClick={() => void account.reload()}>
          Retry
        </Button>
      </div>
    );
  }

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

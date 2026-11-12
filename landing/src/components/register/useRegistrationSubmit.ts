import { useState } from 'react';
import axios from 'axios';
import type { UseFormReturn } from 'react-hook-form';
import { API_BASE, posLoginUrl } from '../../lib/config';
import { getApiErrorMessage } from '../../lib/apiError';
import type { CompleteRegistrationDto, CompleteRegistrationResult, SubscriptionPlanCode, VerifyEmailOtpDto } from '../../shared';
import { ROOT_SERVER_ERROR } from '../forms';
import type { RegistrationFormInput, RegistrationFormValues } from './registrationSchema';
import type { CustomerIdStatus } from './useCustomerIdCheck';

type RegistrationForm = UseFormReturn<RegistrationFormInput, unknown, RegistrationFormValues>;

interface Options {
  form: RegistrationForm;
  plan: SubscriptionPlanCode;
  sessionId: string;
  ensureIdAvailable: (id: string) => Promise<CustomerIdStatus>;
}

/** Verifies the OTP, creates the account, and maps server failures onto the right field. */
export function useRegistrationSubmit({ form, plan, sessionId, ensureIdAvailable }: Options) {
  const [created, setCreated] = useState<CompleteRegistrationResult | null>(null);

  const submit = async (values: RegistrationFormValues) => {
    const id = await ensureIdAvailable(values.customerId);
    if (!id.available) {
      form.setError('customerId', { type: 'server', message: id.message }, { shouldFocus: true });
      return;
    }

    try {
      const verifyBody: VerifyEmailOtpDto = { sessionId, otp: values.otp };
      await axios.post(`${API_BASE}/onboarding/verify-otp`, verifyBody);

      const body: CompleteRegistrationDto = {
        sessionId,
        businessName: values.companyName,
        ownerName: values.contactPerson,
        phone: values.mobileNumber,
        businessType: values.businessType,
        preferredShopId: values.customerId,
        selectedPlanCode: plan,
        address: { city: values.city, state: values.state, pincode: values.pincode, country: 'India' },
      };
      const res = await axios.post(`${API_BASE}/onboarding/complete-registration`, body);
      const result: Partial<CompleteRegistrationResult> = res.data?.data ?? {};
      const shopId = result.shopId || values.customerId;
      setCreated({
        shopId,
        username: result.username || `${values.customerId}_admin`,
        loginUrl: result.loginUrl || posLoginUrl(shopId),
        temporaryPassword: result.temporaryPassword,
      });
    } catch (err) {
      const message = getApiErrorMessage(err, 'Registration failed. Please check your details and try again.');
      const lower = message.toLowerCase();
      if (lower.includes('otp') || lower.includes('code')) {
        form.setError('otp', { type: 'server', message }, { shouldFocus: true });
      } else if (lower.includes('shop id') || lower.includes('customer id')) {
        form.setError('customerId', { type: 'server', message }, { shouldFocus: true });
      } else {
        form.setError(ROOT_SERVER_ERROR, { type: 'server', message });
      }
    }
  };

  return { created, submit, clearCreated: () => setCreated(null) };
}

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useWatch } from 'react-hook-form';
import { ShieldCheck, ArrowLeft } from '@phosphor-icons/react';
import { RetailPosLogo } from '../components/RetailPosLogo';
import { RegistrationHeroColumn } from '../components/register/RegistrationHeroColumn';
import { RegistrationSuccessScreen } from '../components/register/RegistrationSuccessScreen';
import { RegistrationFormFields } from '../components/register/RegistrationFormFields';
import { PlanSwitcher } from '../components/register/PlanSwitcher';
import { EMPTY_REGISTRATION_FORM, registrationSchema } from '../components/register/registrationSchema';
import { useCustomerIdCheck } from '../components/register/useCustomerIdCheck';
import { useEmailOtp } from '../components/register/useEmailOtp';
import { useRegistrationSubmit } from '../components/register/useRegistrationSubmit';
import { Form, useAppForm } from '../components/forms';
import { Spinner } from '../components/ui/Spinner';
import { alphanumericLower } from '../lib/string';
import { getApiErrorMessage } from '../lib/apiError';
import { SUBSCRIPTION_PLANS, SubscriptionPlanCode } from '../shared';

const isPlanCode = (value: string | null): value is SubscriptionPlanCode =>
  !!value && (Object.values(SubscriptionPlanCode) as string[]).includes(value);

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const queryPlan = searchParams.get('plan');
  const [plan, setPlan] = useState<SubscriptionPlanCode>(isPlanCode(queryPlan) ? queryPlan : SubscriptionPlanCode.GROWTH);
  useEffect(() => {
    if (isPlanCode(queryPlan)) setPlan(queryPlan);
  }, [queryPlan]);
  const planInfo = SUBSCRIPTION_PLANS[plan] || SUBSCRIPTION_PLANS[SubscriptionPlanCode.GROWTH];

  const form = useAppForm(registrationSchema, { defaultValues: EMPTY_REGISTRATION_FORM });
  const customerId = useWatch({ control: form.control, name: 'customerId' });
  const idCheck = useCustomerIdCheck(customerId);
  const otp = useEmailOtp();
  const registration = useRegistrationSubmit({ form, plan, sessionId: otp.sessionId, ensureIdAvailable: idCheck.ensure });

  // A taken / unchecked ID is a blocking error; the next keystroke re-validates and clears it.
  const { status: idStatus } = idCheck;
  useEffect(() => {
    if (idStatus && !idStatus.available) form.setError('customerId', { type: 'server', message: idStatus.message });
  }, [idStatus, form]);

  // Suggest a Customer ID from the shop name until the user types their own (clearing it re-enables suggestions).
  const idTypedByUser = useRef(false);
  const suggestCustomerId = (companyName: string) => {
    if (idTypedByUser.current) return;
    const suggested = alphanumericLower(companyName, 6);
    form.setValue('customerId', suggested.length >= 3 ? suggested : '', { shouldValidate: suggested.length >= 3 });
  };

  // A different email needs a fresh code.
  const resetOtp = () => {
    if (!form.getValues('otpSent')) return;
    otp.reset();
    form.setValue('otpSent', false);
    form.setValue('otp', '');
    form.clearErrors('otp');
  };

  const sendOtp = async () => {
    if (!(await form.trigger('email', { shouldFocus: true }))) return;
    try {
      await otp.send(form.getValues('email').trim(), plan);
      form.setValue('otpSent', true);
      form.setValue('otp', '');
      form.clearErrors('otp');
    } catch (err) {
      form.setError('email', {
        type: 'server',
        message: getApiErrorMessage(err, "We couldn't send the code. Check the address and try again shortly."),
      });
    }
  };

  const registerAnother = () => {
    registration.clearCreated();
    otp.reset();
    idCheck.reset();
    idTypedByUser.current = false;
    form.reset(EMPTY_REGISTRATION_FORM);
  };

  const submitting = form.formState.isSubmitting;

  return (
    <div className="min-h-screen bg-[#070b19] flex flex-col font-sans text-zinc-100">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200">
        <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-8 lg:px-14 xl:px-16 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <RetailPosLogo />
          </Link>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <ShieldCheck weight="fill" className="w-4 h-4 text-emerald-600" />
            <span>256-Bit SSL Encrypted Setup</span>
          </div>
          <Link to="/" className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-700 hover:text-red-600 transition-colors">
            <ArrowLeft weight="bold" className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1680px] mx-auto px-4 sm:px-8 lg:px-14 xl:px-16 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">
          <RegistrationHeroColumn />

          <div className="lg:col-span-7">
            <div className="bg-white text-zinc-950 p-6 sm:p-9 rounded-md border border-zinc-200">
              {registration.created ? (
                <RegistrationSuccessScreen
                  data={{ ...registration.created, planName: planInfo.name }}
                  onRegisterAnother={registerAnother}
                />
              ) : (
                <Form form={form} onSubmit={registration.submit} errorSummary className="space-y-5 text-left">
                  <div>
                    <h2 className="text-2xl font-black text-zinc-950 tracking-tight">Create your Vendora RetailPOS account</h2>
                    <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                      Your login details are emailed to you as soon as the account is ready.
                    </p>
                  </div>

                  <PlanSwitcher selected={plan} planInfo={planInfo} onSelect={setPlan} />

                  <RegistrationFormFields
                    idStatus={idCheck.status}
                    checkingId={idCheck.checking}
                    sendingOtp={otp.sending}
                    resendIn={otp.resendIn}
                    onSendOtp={sendOtp}
                    onCompanyNameChange={suggestCustomerId}
                    onCustomerIdChange={(value) => (idTypedByUser.current = value !== '')}
                    onEmailChange={resetOtp}
                  />

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting && <Spinner size="md" />}
                    <span>{submitting ? 'Setting up your store…' : 'Create account'}</span>
                  </button>
                </Form>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-zinc-400">
        <p>© 2026 Vendora RetailPOS. All rights reserved.</p>
      </footer>
    </div>
  );
}

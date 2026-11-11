import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from '@phosphor-icons/react';
import axios from 'axios';
import { RetailPosLogo } from '../components/RetailPosLogo';
import { RegistrationHeroColumn } from '../components/register/RegistrationHeroColumn';
import { RegistrationSuccessScreen } from '../components/register/RegistrationSuccessScreen';
import { RegistrationFormFields } from '../components/register/RegistrationFormFields';
import {
  EMAIL_REGEX,
  EMPTY_REGISTRATION_FORM,
  validateRegistrationForm,
} from '../components/register/registrationForm';
import type { FieldChangeHandler, RegistrationFormValues } from '../components/register/registrationForm';
import { SUBSCRIPTION_PLANS, SubscriptionPlanCode } from '../shared';
import type {
  CompleteRegistrationDto,
  CompleteRegistrationResult,
  RequestEmailOtpDto,
  VerifyEmailOtpDto,
} from '../shared';
import { API_BASE, posLoginUrl } from '../lib/config';
import { getApiErrorMessage } from '../lib/apiError';

const OTP_RESEND_SECONDS = 60;

const isPlanCode = (value: string | null): value is SubscriptionPlanCode =>
  !!value && (Object.values(SubscriptionPlanCode) as string[]).includes(value);

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const queryPlan = searchParams.get('plan');

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanCode>(
    isPlanCode(queryPlan) ? queryPlan : SubscriptionPlanCode.GROWTH
  );

  const [form, setForm] = useState<RegistrationFormValues>(EMPTY_REGISTRATION_FORM);
  const [isCheckingId, setIsCheckingId] = useState(false);
  const [idCheckStatus, setIdCheckStatus] = useState<{ available: boolean; message: string } | null>(null);

  // Field validation error state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(OTP_RESEND_SECONDS);
  const [sessionId, setSessionId] = useState('');

  // Submission & Success state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdData, setCreatedData] = useState<CompleteRegistrationResult | null>(null);

  useEffect(() => {
    if (isPlanCode(queryPlan)) {
      setSelectedPlan(queryPlan);
    }
  }, [queryPlan]);

  useEffect(() => {
    if (!otpSent || resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [otpSent, resendTimer]);

  const planInfo = SUBSCRIPTION_PLANS[selectedPlan] || SUBSCRIPTION_PLANS[SubscriptionPlanCode.GROWTH];

  const setFieldError = (field: string, message: string) =>
    setFieldErrors((prev) => ({ ...prev, [field]: message }));

  const clearFieldError = (...fields: string[]) => {
    setFieldErrors((prev) => {
      if (!fields.some((f) => prev[f])) return prev;
      const next = { ...prev };
      fields.forEach((f) => delete next[f]);
      return next;
    });
  };

  const handleFieldChange: FieldChangeHandler = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Suggest a Customer ID from the shop name until the user types one.
      if (field === 'companyName' && !prev.customerId) {
        const suggested = String(value).toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 6);
        if (suggested.length >= 3) next.customerId = suggested;
      }
      // A new email address needs a fresh OTP.
      if (field === 'email') next.otp = '';
      return next;
    });
    clearFieldError(field);

    if (field === 'customerId' || (field === 'companyName' && !form.customerId)) {
      setIdCheckStatus(null);
      clearFieldError('customerId');
    }
    if (field === 'email') {
      setOtpSent(false);
      setSessionId('');
      clearFieldError('otp');
    }
  };

  // Check Customer ID availability via live API on blur or check button
  const checkCustomerIdValidity = async (): Promise<boolean> => {
    const cleanId = form.customerId.trim().toLowerCase();
    if (!cleanId) {
      setFieldError('customerId', 'Customer ID is required (3 to 6 characters).');
      setIdCheckStatus(null);
      return false;
    }

    if (cleanId.length < 3 || cleanId.length > 6) {
      setFieldError('customerId', 'Customer ID must be between 3 and 6 letters or numbers.');
      setIdCheckStatus({ available: false, message: 'Must be 3 to 6 characters' });
      return false;
    }

    if (!/^[a-z0-9]+$/i.test(cleanId)) {
      setFieldError('customerId', 'Only letters and numbers are allowed.');
      setIdCheckStatus({ available: false, message: 'Only alphanumeric characters allowed' });
      return false;
    }

    clearFieldError('customerId');
    setIsCheckingId(true);

    try {
      const res = await axios.get(`${API_BASE}/onboarding/check-subdomain`, { params: { shopId: cleanId } });
      if (res.data?.success && res.data?.data?.isAvailable) {
        clearFieldError('customerId');
        setIdCheckStatus({
          available: true,
          message: res.data?.data?.message || `"${cleanId}" is available!`,
        });
        return true;
      }
      const reason = res.data?.data?.reason || `Customer ID "${cleanId}" is already taken. Please choose another.`;
      setFieldError('customerId', reason);
      setIdCheckStatus({ available: false, message: reason });
      return false;
    } catch (err) {
      const errMsg = getApiErrorMessage(err, 'Unable to check this Customer ID right now. Please try again.');
      setFieldError('customerId', errMsg);
      setIdCheckStatus({ available: false, message: errMsg });
      return false;
    } finally {
      setIsCheckingId(false);
    }
  };

  const handleSendOtp = async () => {
    const cleanEmail = form.email.trim();
    if (!cleanEmail) {
      setFieldError('email', 'Email address is required to receive OTP.');
      return;
    }
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setFieldError('email', 'Please enter a valid email address.');
      return;
    }

    clearFieldError('email', 'otp');
    setIsSendingOtp(true);
    try {
      const body: RequestEmailOtpDto = { email: cleanEmail, selectedPlanCode: selectedPlan };
      const res = await axios.post(`${API_BASE}/onboarding/request-otp`, body);
      if (res.data?.data?.sessionId) {
        setSessionId(res.data.data.sessionId);
      }
      setOtpSent(true);
      setResendTimer(OTP_RESEND_SECONDS);
    } catch (err) {
      setFieldError(
        'email',
        getApiErrorMessage(err, "We couldn't send the verification email. Please check the address and try again shortly."),
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const errors = validateRegistrationForm(form, otpSent);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const isIdValid = await checkCustomerIdValidity();
    if (!isIdValid) return;

    setIsSubmitting(true);
    const cleanId = form.customerId.trim().toLowerCase();

    try {
      const verifyBody: VerifyEmailOtpDto = { sessionId, otp: form.otp.trim() };
      await axios.post(`${API_BASE}/onboarding/verify-otp`, verifyBody);

      const registrationBody: CompleteRegistrationDto = {
        sessionId,
        businessName: form.companyName.trim(),
        ownerName: form.contactPerson.trim(),
        phone: form.mobileNumber,
        businessType: form.businessType,
        preferredShopId: cleanId,
        selectedPlanCode: selectedPlan,
        address: {
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
          country: 'India',
        },
      };
      const res = await axios.post(`${API_BASE}/onboarding/complete-registration`, registrationBody);
      const result: Partial<CompleteRegistrationResult> = res.data?.data ?? {};
      const shopId = result.shopId || cleanId;

      setCreatedData({
        shopId,
        username: result.username || `${cleanId}_admin`,
        loginUrl: result.loginUrl || posLoginUrl(shopId),
        temporaryPassword: result.temporaryPassword,
      });
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Registration failed. Please check your details and try again.');
      setSubmitError(msg);
      const lower = msg.toLowerCase();
      if (lower.includes('otp')) {
        setFieldError('otp', msg);
      } else if (lower.includes('shop id') || lower.includes('customer id')) {
        setFieldError('customerId', msg);
        setIdCheckStatus({ available: false, message: msg });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterAnother = () => {
    setCreatedData(null);
    setForm(EMPTY_REGISTRATION_FORM);
    setSessionId('');
    setOtpSent(false);
    setResendTimer(OTP_RESEND_SECONDS);
    setFieldErrors({});
    setSubmitError('');
    setIdCheckStatus(null);
  };

  return (
    <div className="min-h-screen bg-[#070b19] flex flex-col font-sans select-none text-zinc-100">
      {/* Top Navbar */}
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

      {/* Main Registration Content */}
      <main className="flex-1 w-full max-w-[1680px] mx-auto px-4 sm:px-8 lg:px-14 xl:px-16 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">
          <RegistrationHeroColumn />

          <div className="lg:col-span-7">
            <div className="bg-white text-zinc-950 p-6 sm:p-9 rounded-md border border-zinc-200">
              {createdData ? (
                <RegistrationSuccessScreen
                  data={{ ...createdData, planName: planInfo.name }}
                  onRegisterAnother={handleRegisterAnother}
                />
              ) : (
                <RegistrationFormFields
                  values={form}
                  onFieldChange={handleFieldChange}
                  selectedPlan={selectedPlan}
                  planInfo={planInfo}
                  onSelectPlan={setSelectedPlan}
                  onCustomerIdBlur={() => {
                    if (form.customerId.trim()) checkCustomerIdValidity();
                  }}
                  onManualCheckId={checkCustomerIdValidity}
                  isCheckingId={isCheckingId}
                  idCheckStatus={idCheckStatus}
                  otpSent={otpSent}
                  isSendingOtp={isSendingOtp}
                  resendTimer={resendTimer}
                  onSendOtp={handleSendOtp}
                  fieldErrors={fieldErrors}
                  submitError={submitError}
                  isSubmitting={isSubmitting}
                  onSubmit={handleCreateAccount}
                />
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

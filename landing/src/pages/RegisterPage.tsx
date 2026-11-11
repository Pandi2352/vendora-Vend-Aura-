import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from '@phosphor-icons/react';
import axios from 'axios';
import { RetailPosLogo } from '../components/RetailPosLogo';
import { RegistrationHeroColumn } from '../components/register/RegistrationHeroColumn';
import { RegistrationSuccessScreen } from '../components/register/RegistrationSuccessScreen';
import { RegistrationFormFields } from '../components/register/RegistrationFormFields';
import { SUBSCRIPTION_PLANS, SubscriptionPlanCode, BusinessType } from '../shared';

const API_BASE = 'http://localhost:5000/api/v1';

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const queryPlan = searchParams.get('plan') as SubscriptionPlanCode;

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanCode>(
    queryPlan && Object.values(SubscriptionPlanCode).includes(queryPlan)
      ? queryPlan
      : SubscriptionPlanCode.GROWTH
  );

  // Form fields
  const [customerId, setCustomerId] = useState('');
  const [isCheckingId, setIsCheckingId] = useState(false);
  const [idCheckStatus, setIdCheckStatus] = useState<{ available: boolean; message: string } | null>(null);

  const [companyName, setCompanyName] = useState('');
  const [city, setCity] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>(BusinessType.TEXTILE_GARMENTS);
  const [contactPerson, setContactPerson] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');

  // Field validation error state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  // OTP state
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [sessionId, setSessionId] = useState('');

  // Submission & Success state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdData, setCreatedData] = useState<{
    shopId: string;
    username: string;
    loginUrl: string;
    temporaryPassword?: string;
  } | null>(null);

  useEffect(() => {
    if (queryPlan && Object.values(SubscriptionPlanCode).includes(queryPlan)) {
      setSelectedPlan(queryPlan);
    }
  }, [queryPlan]);

  useEffect(() => {
    let interval: any;
    if (otpSent && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, resendTimer]);

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Check Customer ID availability via live API on blur or check button
  const checkCustomerIdValidity = async (idToValidate?: string): Promise<boolean> => {
    const cleanId = (idToValidate !== undefined ? idToValidate : customerId).trim().toLowerCase();
    if (!cleanId) {
      setFieldErrors((prev) => ({ ...prev, customerId: 'Customer ID is required (3 to 6 characters).' }));
      setIdCheckStatus(null);
      return false;
    }

    if (cleanId.length < 3 || cleanId.length > 6) {
      setFieldErrors((prev) => ({ ...prev, customerId: 'Customer ID must be between 3 and 6 letters or numbers.' }));
      setIdCheckStatus({ available: false, message: 'Must be 3 to 6 characters' });
      return false;
    }

    if (!/^[a-z0-9]+$/i.test(cleanId)) {
      setFieldErrors((prev) => ({ ...prev, customerId: 'Only letters and numbers are allowed.' }));
      setIdCheckStatus({ available: false, message: 'Only alphanumeric characters allowed' });
      return false;
    }

    clearFieldError('customerId');
    setIsCheckingId(true);

    try {
      const res = await axios.get(`${API_BASE}/onboarding/check-subdomain?shopId=${cleanId}`);
      if (res.data?.success && res.data?.data?.isAvailable) {
        clearFieldError('customerId');
        setIdCheckStatus({
          available: true,
          message: res.data?.data?.message || `"${cleanId}" is available!`,
        });
        return true;
      } else {
        const reason = res.data?.data?.reason || `Customer ID "${cleanId}" is already taken. Please choose another.`;
        setFieldErrors((prev) => ({ ...prev, customerId: reason }));
        setIdCheckStatus({ available: false, message: reason });
        return false;
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Unable to verify Customer ID. Please check server.';
      setFieldErrors((prev) => ({ ...prev, customerId: errMsg }));
      setIdCheckStatus({ available: false, message: errMsg });
      return false;
    } finally {
      setIsCheckingId(false);
    }
  };

  const handleCustomerIdBlur = () => {
    if (customerId.trim()) {
      checkCustomerIdValidity();
    }
  };

  const handleCompanyNameChange = (val: string) => {
    setCompanyName(val);
    clearFieldError('companyName');
    if (!customerId) {
      const sanitized = val.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 6);
      if (sanitized.length >= 3) {
        setCustomerId(sanitized);
        setIdCheckStatus(null);
        clearFieldError('customerId');
      }
    }
  };

  const handleSendOtp = async () => {
    const cleanEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail) {
      setFieldErrors((prev) => ({ ...prev, email: 'Email address is required to receive OTP.' }));
      return;
    }
    if (!emailRegex.test(cleanEmail)) {
      setFieldErrors((prev) => ({ ...prev, email: 'Please enter a valid email address.' }));
      return;
    }

    clearFieldError('email');
    clearFieldError('otp');
    setIsSendingOtp(true);
    try {
      const res = await axios.post(`${API_BASE}/onboarding/request-otp`, {
        email: cleanEmail,
        plan: selectedPlan,
      });
      if (res.data?.data?.sessionId) {
        setSessionId(res.data.data.sessionId);
      }
      setOtpSent(true);
      setResendTimer(60);
    } catch (err: any) {
      setFieldErrors((prev) => ({
        ...prev,
        email: err.response?.data?.message || 'Failed to dispatch verification email. Verify SMTP settings.',
      }));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const cleanId = customerId.trim().toLowerCase();
    if (!cleanId) {
      errors.customerId = 'Customer ID is required.';
    } else if (cleanId.length < 3 || cleanId.length > 6) {
      errors.customerId = 'Customer ID must be between 3 and 6 characters.';
    }

    if (!companyName.trim()) errors.companyName = 'Company or shop name is required.';
    if (!city.trim()) errors.city = 'City is required.';
    if (!contactPerson.trim()) errors.contactPerson = 'Contact person name is required.';

    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (!mobileNumber.trim()) {
      errors.mobileNumber = 'Mobile number is required.';
    } else if (cleanMobile.length !== 10) {
      errors.mobileNumber = 'Please enter a valid 10-digit mobile number.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!otpSent) {
      errors.otp = 'Please click "Send OTP" to verify your email first.';
    } else if (!otp.trim()) {
      errors.otp = 'Please enter the 6-digit verification code from your email.';
    } else if (otp.trim().length !== 6) {
      errors.otp = 'Verification code must be exactly 6 digits.';
    }

    return errors;
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const isIdValid = await checkCustomerIdValidity();
    if (!isIdValid) return;

    setIsSubmitting(true);
    const cleanId = customerId.trim().toLowerCase();

    try {
      await axios.post(`${API_BASE}/onboarding/verify-otp`, {
        sessionId,
        otp: otp.trim(),
      });

      const res = await axios.post(`${API_BASE}/onboarding/complete-registration`, {
        sessionId,
        businessName: companyName.trim(),
        ownerName: contactPerson.trim(),
        phone: mobileNumber.trim(),
        businessType,
        preferredShopId: cleanId,
        address: {
          street: 'Main Commercial Hub',
          city: city.trim(),
          state: 'Tamil Nadu',
          pincode: '600001',
          country: 'India',
        },
      });

      setCreatedData({
        shopId: res.data?.data?.shopId || cleanId,
        username: res.data?.data?.username || `${cleanId}_admin`,
        loginUrl: res.data?.data?.loginUrl || 'http://localhost:4001',
        temporaryPassword: res.data?.data?.temporaryPassword,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please check inputs and retry.';
      setSubmitError(msg);
      if (msg.toLowerCase().includes('otp')) {
        setFieldErrors((prev) => ({ ...prev, otp: msg }));
      } else if (msg.toLowerCase().includes('shop id') || msg.toLowerCase().includes('customer id')) {
        setFieldErrors((prev) => ({ ...prev, customerId: msg }));
        setIdCheckStatus({ available: false, message: msg });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const planInfo = SUBSCRIPTION_PLANS[selectedPlan] || SUBSCRIPTION_PLANS[SubscriptionPlanCode.GROWTH];

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
                  onRegisterAnother={() => {
                    setCreatedData(null);
                    setCustomerId('');
                    setCompanyName('');
                    setCity('');
                    setContactPerson('');
                    setMobileNumber('');
                    setEmail('');
                    setOtpSent(false);
                    setOtp('');
                    setFieldErrors({});
                    setIdCheckStatus(null);
                  }}
                />
              ) : (
                <RegistrationFormFields
                  selectedPlan={selectedPlan}
                  onSelectPlan={setSelectedPlan}
                  customerId={customerId}
                  onCustomerIdChange={(val) => {
                    setCustomerId(val);
                    clearFieldError('customerId');
                    setIdCheckStatus(null);
                  }}
                  onCustomerIdBlur={handleCustomerIdBlur}
                  onManualCheckId={() => checkCustomerIdValidity()}
                  isCheckingId={isCheckingId}
                  idCheckStatus={idCheckStatus}
                  companyName={companyName}
                  onCompanyNameChange={handleCompanyNameChange}
                  city={city}
                  onCityChange={(val) => {
                    setCity(val);
                    clearFieldError('city');
                  }}
                  businessType={businessType}
                  onBusinessTypeChange={setBusinessType}
                  contactPerson={contactPerson}
                  onContactPersonChange={(val) => {
                    setContactPerson(val);
                    clearFieldError('contactPerson');
                  }}
                  mobileNumber={mobileNumber}
                  onMobileNumberChange={(val) => {
                    setMobileNumber(val);
                    clearFieldError('mobileNumber');
                  }}
                  email={email}
                  onEmailChange={(val) => {
                    setEmail(val);
                    setOtpSent(false);
                    setOtp('');
                    clearFieldError('email');
                    clearFieldError('otp');
                  }}
                  otp={otp}
                  onOtpChange={(val) => {
                    setOtp(val);
                    clearFieldError('otp');
                  }}
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

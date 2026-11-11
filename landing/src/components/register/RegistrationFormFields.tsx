import { WarningCircle, CircleNotch } from '@phosphor-icons/react';
import { CustomerIdField } from './CustomerIdField';
import { BusinessTypeDropdown } from '../BusinessTypeDropdown';
import { SubscriptionPlanCode, BusinessType, SUBSCRIPTION_PLANS } from '../../shared';

interface IdCheckStatus {
  available: boolean;
  message: string;
}

interface RegistrationFormFieldsProps {
  selectedPlan: SubscriptionPlanCode;
  onSelectPlan: (plan: SubscriptionPlanCode) => void;
  customerId: string;
  onCustomerIdChange: (val: string) => void;
  onCustomerIdBlur: () => void;
  onManualCheckId: () => void;
  isCheckingId: boolean;
  idCheckStatus: IdCheckStatus | null;
  companyName: string;
  onCompanyNameChange: (val: string) => void;
  city: string;
  onCityChange: (val: string) => void;
  businessType: BusinessType;
  onBusinessTypeChange: (val: BusinessType) => void;
  contactPerson: string;
  onContactPersonChange: (val: string) => void;
  mobileNumber: string;
  onMobileNumberChange: (val: string) => void;
  email: string;
  onEmailChange: (val: string) => void;
  otp: string;
  onOtpChange: (val: string) => void;
  otpSent: boolean;
  isSendingOtp: boolean;
  resendTimer: number;
  onSendOtp: () => void;
  fieldErrors: Record<string, string>;
  submitError: string;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function RegistrationFormFields({
  selectedPlan,
  onSelectPlan,
  customerId,
  onCustomerIdChange,
  onCustomerIdBlur,
  onManualCheckId,
  isCheckingId,
  idCheckStatus,
  companyName,
  onCompanyNameChange,
  city,
  onCityChange,
  businessType,
  onBusinessTypeChange,
  contactPerson,
  onContactPersonChange,
  mobileNumber,
  onMobileNumberChange,
  email,
  onEmailChange,
  otp,
  onOtpChange,
  otpSent,
  isSendingOtp,
  resendTimer,
  onSendOtp,
  fieldErrors,
  submitError,
  isSubmitting,
  onSubmit,
}: RegistrationFormFieldsProps) {
  const planInfo = SUBSCRIPTION_PLANS[selectedPlan] || SUBSCRIPTION_PLANS[SubscriptionPlanCode.GROWTH];

  return (
    <form onSubmit={onSubmit} className="space-y-5 text-left font-sans" noValidate>
      <div>
        <h2 className="text-2xl font-black text-zinc-950 tracking-tight">
          Create your Vendora RetailPOS account
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Your login details are emailed to you as soon as the account is ready.
        </p>
      </div>

      {submitError && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
          <WarningCircle weight="fill" className="w-4 h-4 shrink-0 text-red-500" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Plan Switcher */}
      <div className="p-3.5 rounded-md bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700 uppercase">
            Plan
          </span>
          <span className="text-xs sm:text-sm font-bold text-zinc-900">
            {planInfo.name} ({planInfo.monthlyPrice === 0 ? '30 Days Free' : `₹${planInfo.monthlyPrice}/mo`})
          </span>
        </div>
        <div className="flex items-center gap-1">
          {Object.values(SubscriptionPlanCode).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => onSelectPlan(code)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                selectedPlan === code
                  ? 'bg-zinc-950 text-white'
                  : 'bg-zinc-200/80 hover:bg-zinc-300 text-zinc-700'
              }`}
            >
              {code === SubscriptionPlanCode.FREE_TRIAL ? 'Trial' : code.charAt(0) + code.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Customer ID Field with onBlur duplication check */}
      <CustomerIdField
        value={customerId}
        onChange={onCustomerIdChange}
        onBlur={onCustomerIdBlur}
        onManualCheck={onManualCheckId}
        isChecking={isCheckingId}
        checkStatus={idCheckStatus}
        errorMessage={fieldErrors.customerId}
      />

      {/* Company Name & City */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-zinc-900 mb-1.5">
            Company / shop name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => onCompanyNameChange(e.target.value)}
            placeholder="e.g. Apex Supermarket"
            className={`w-full px-3.5 py-2.5 rounded-md border text-sm font-medium outline-hidden transition-all ${
              fieldErrors.companyName
                ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-zinc-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
          />
          {fieldErrors.companyName && (
            <p className="text-red-600 text-xs font-semibold mt-1.5 flex items-center gap-1.5">
              <WarningCircle weight="fill" className="w-3.5 h-3.5 shrink-0 text-red-500" />
              <span>{fieldErrors.companyName}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-900 mb-1.5">
            City <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            placeholder="Start typing your city"
            className={`w-full px-3.5 py-2.5 rounded-md border text-sm font-medium outline-hidden transition-all ${
              fieldErrors.city
                ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-zinc-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
          />
          {fieldErrors.city && (
            <p className="text-red-600 text-xs font-semibold mt-1.5 flex items-center gap-1.5">
              <WarningCircle weight="fill" className="w-3.5 h-3.5 shrink-0 text-red-500" />
              <span>{fieldErrors.city}</span>
            </p>
          )}
        </div>
      </div>

      {/* Business Type & Contact Person */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-zinc-900 mb-1.5">
            Business type <span className="text-red-600">*</span>
          </label>
          <BusinessTypeDropdown value={businessType} onChange={onBusinessTypeChange} />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-900 mb-1.5">
            Contact person <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={contactPerson}
            onChange={(e) => onContactPersonChange(e.target.value)}
            placeholder="e.g. Ramesh Kumar"
            className={`w-full px-3.5 py-2.5 rounded-md border text-sm font-medium outline-hidden transition-all ${
              fieldErrors.contactPerson
                ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-zinc-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
          />
          {fieldErrors.contactPerson && (
            <p className="text-red-600 text-xs font-semibold mt-1.5 flex items-center gap-1.5">
              <WarningCircle weight="fill" className="w-3.5 h-3.5 shrink-0 text-red-500" />
              <span>{fieldErrors.contactPerson}</span>
            </p>
          )}
        </div>
      </div>

      {/* Mobile Number */}
      <div>
        <label className="block text-xs font-bold text-zinc-900 mb-1.5">
          Mobile number <span className="text-red-600">*</span>
        </label>
        <input
          type="tel"
          value={mobileNumber}
          onChange={(e) => onMobileNumberChange(e.target.value)}
          placeholder="9080709078"
          maxLength={10}
          className={`w-full px-3.5 py-2.5 rounded-md border text-sm font-medium outline-hidden transition-all ${
            fieldErrors.mobileNumber
              ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500'
              : 'border-zinc-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          }`}
        />
        {fieldErrors.mobileNumber && (
          <p className="text-red-600 text-xs font-semibold mt-1.5 flex items-center gap-1.5">
            <WarningCircle weight="fill" className="w-3.5 h-3.5 shrink-0 text-red-500" />
            <span>{fieldErrors.mobileNumber}</span>
          </p>
        )}
      </div>

      {/* Email & Send OTP */}
      <div>
        <label className="block text-xs font-bold text-zinc-900 mb-1.5">
          Email <span className="text-red-600">*</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="mvp.bose52@gmail.com"
            className={`w-full px-3.5 py-2.5 rounded-md border text-sm font-medium outline-hidden transition-all ${
              fieldErrors.email
                ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-zinc-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
          />
          <button
            type="button"
            onClick={onSendOtp}
            disabled={isSendingOtp || (otpSent && resendTimer > 0)}
            className={`px-5 py-2.5 rounded-md text-white font-bold text-sm shrink-0 transition-colors cursor-pointer ${
              otpSent && resendTimer > 0
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSendingOtp ? (
              <div className="flex items-center gap-1.5">
                <CircleNotch className="w-4 h-4 animate-spin" />
                <span>Sending</span>
              </div>
            ) : otpSent && resendTimer > 0 ? (
              <span>Resend in {resendTimer}s</span>
            ) : otpSent ? (
              <span>Resend OTP</span>
            ) : (
              <span>Send OTP</span>
            )}
          </button>
        </div>

        {fieldErrors.email ? (
          <p className="text-red-600 text-xs font-semibold mt-1.5 flex items-center gap-1.5">
            <WarningCircle weight="fill" className="w-3.5 h-3.5 shrink-0 text-red-500" />
            <span>{fieldErrors.email}</span>
          </p>
        ) : (
          <p className="text-zinc-500 text-xs mt-1">
            We'll email you a 6-digit code to confirm it's you.
          </p>
        )}
      </div>

      {/* OTP Field */}
      {otpSent ? (
        <div className="pt-1">
          <label className="block text-xs font-bold text-zinc-900 mb-1.5">
            OTP <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, '').substring(0, 6))}
            placeholder="6-digit code from your email"
            maxLength={6}
            className={`w-full px-3.5 py-2.5 rounded-md border text-sm font-medium outline-hidden transition-all ${
              fieldErrors.otp
                ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-blue-500 focus:border-blue-600 focus:ring-1 focus:ring-blue-500'
            }`}
          />
          {fieldErrors.otp ? (
            <p className="text-red-600 text-xs font-semibold mt-1.5 flex items-center gap-1.5">
              <WarningCircle weight="fill" className="w-3.5 h-3.5 shrink-0 text-red-500" />
              <span>{fieldErrors.otp}</span>
            </p>
          ) : (
            <p className="text-emerald-600 text-xs mt-1.5 font-medium flex items-center gap-1">
              <span>✓</span>
              <span>OTP sent to {email}. Check your inbox (and spam). It works for 10 minutes.</span>
            </p>
          )}
        </div>
      ) : (
        fieldErrors.otp && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200">
            <p className="text-red-600 text-xs font-semibold flex items-center gap-1.5">
              <WarningCircle weight="fill" className="w-3.5 h-3.5 shrink-0 text-red-500" />
              <span>{fieldErrors.otp}</span>
            </p>
          </div>
        )
      )}

      {/* Submit Button */}
      <div className="pt-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-base transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <CircleNotch className="w-5 h-5 animate-spin" />
              <span>Provisioning your retail instance...</span>
            </>
          ) : (
            <span>Create account</span>
          )}
        </button>
      </div>
    </form>
  );
}


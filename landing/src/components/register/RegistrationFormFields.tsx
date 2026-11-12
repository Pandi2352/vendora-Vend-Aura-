import { useWatch } from 'react-hook-form';
import { Buildings, EnvelopeSimple, MapPin, User } from '@phosphor-icons/react';
import { DropdownField, EmailField, OtpField, PhoneField, TextField } from '../forms';
import { Spinner } from '../ui/Spinner';
import { alphanumericLower, digitsOnly } from '../../lib/string';
import { storeHost, storeHostSuffix } from '../../lib/config';
import { BUSINESS_TYPE_OPTIONS } from './businessTypeOptions';
import type { CustomerIdStatus } from './useCustomerIdCheck';
import type { RegistrationFormInput } from './registrationSchema';

interface RegistrationFormFieldsProps {
  idStatus: CustomerIdStatus | null;
  checkingId: boolean;
  sendingOtp: boolean;
  resendIn: number;
  onSendOtp: () => void;
  onCompanyNameChange: (value: string) => void;
  onCustomerIdChange: (value: string) => void;
  onEmailChange: () => void;
}

/** All registration inputs; must be rendered inside <Form>. */
export function RegistrationFormFields({
  idStatus,
  checkingId,
  sendingOtp,
  resendIn,
  onSendOtp,
  onCompanyNameChange,
  onCustomerIdChange,
  onEmailChange,
}: RegistrationFormFieldsProps) {
  const [customerId, email, otpSent] = useWatch<RegistrationFormInput, ['customerId', 'email', 'otpSent']>({
    name: ['customerId', 'email', 'otpSent'],
  });

  const sendLabel = sendingOtp ? 'Sending…' : resendIn > 0 ? `Resend in ${resendIn}s` : otpSent ? 'Resend code' : 'Send code';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-6 gap-x-4 gap-y-1">
      <TextField
        name="customerId"
        label="Customer ID"
        required
        className="sm:col-span-6"
        placeholder="e.g. kmart"
        autoComplete="off"
        spellCheck={false}
        maxLength={6}
        inputClassName="font-semibold"
        normalize={(v) => alphanumericLower(v, 6)}
        loading={checkingId}
        onValueChange={onCustomerIdChange}
        rightAddon={<span className="pr-1.5 text-xs text-zinc-400 hidden sm:inline">{storeHostSuffix()}</span>}
        tooltip="You sign in with this ID, and it becomes your store address. It cannot be changed later."
        hint="3 to 6 lower-case letters or numbers"
        success={
          idStatus?.available ? (
            <>
              {idStatus.message}. Your store: <strong className="font-mono">{storeHost(customerId)}</strong>
            </>
          ) : undefined
        }
      />

      <TextField
        name="companyName"
        label="Company / shop name"
        required
        className="sm:col-span-6"
        placeholder="e.g. Apex Supermarket"
        autoComplete="organization"
        maxLength={120}
        leftIcon={<Buildings />}
        onValueChange={onCompanyNameChange}
      />

      <TextField name="city" label="City" required className="sm:col-span-2" placeholder="e.g. Coimbatore" autoComplete="address-level2" leftIcon={<MapPin />} />
      <TextField name="state" label="State" required className="sm:col-span-2" placeholder="e.g. Tamil Nadu" autoComplete="address-level1" />
      <TextField
        name="pincode"
        label="Pincode"
        required
        className="sm:col-span-2"
        placeholder="6 digits"
        inputMode="numeric"
        autoComplete="postal-code"
        maxLength={6}
        normalize={(v) => digitsOnly(v, 6)}
      />

      <DropdownField
        name="businessType"
        label="Business type"
        required
        className="sm:col-span-3"
        options={BUSINESS_TYPE_OPTIONS}
        searchPlaceholder="Search business types…"
      />
      <TextField
        name="contactPerson"
        label="Contact person"
        required
        className="sm:col-span-3"
        placeholder="e.g. Ramesh Kumar"
        autoComplete="name"
        maxLength={80}
        leftIcon={<User />}
      />

      <PhoneField name="mobileNumber" label="Mobile number" required className="sm:col-span-6" />

      <EmailField
        name="email"
        label="Email"
        required
        className="sm:col-span-6"
        placeholder="owner@yourshop.in"
        leftIcon={<EnvelopeSimple />}
        onValueChange={onEmailChange}
        hint="Your login details are sent here. We email a 6-digit code to confirm it's yours."
        success={otpSent ? `Code sent to ${email}. Check your inbox (and spam); it works for 10 minutes.` : undefined}
        rightAddon={
          <button
            type="button"
            onClick={onSendOtp}
            disabled={sendingOtp || resendIn > 0}
            className="h-8 px-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold whitespace-nowrap inline-flex items-center gap-1.5 cursor-pointer disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {sendingOtp && <Spinner size="sm" />}
            {sendLabel}
          </button>
        }
      />

      <OtpField
        name="otp"
        label="Verification code"
        required
        className="sm:col-span-6"
        disabled={!otpSent}
        hint={otpSent ? 'Paste or type the 6-digit code from the email.' : 'Press "Send code" above to get your code.'}
      />
    </div>
  );
}

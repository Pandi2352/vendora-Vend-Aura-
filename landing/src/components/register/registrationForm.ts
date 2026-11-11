import { BusinessType } from '../../shared';

export interface RegistrationFormValues {
  customerId: string;
  companyName: string;
  city: string;
  state: string;
  pincode: string;
  businessType: BusinessType;
  contactPerson: string;
  mobileNumber: string;
  email: string;
  otp: string;
}

export type RegistrationField = keyof RegistrationFormValues;

export type FieldChangeHandler = <K extends RegistrationField>(
  field: K,
  value: RegistrationFormValues[K],
) => void;

export const EMPTY_REGISTRATION_FORM: RegistrationFormValues = {
  customerId: '',
  companyName: '',
  city: '',
  state: '',
  pincode: '',
  businessType: BusinessType.TEXTILE_GARMENTS,
  contactPerson: '',
  mobileNumber: '',
  email: '',
  otp: '',
};

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PINCODE_REGEX = /^[1-9]\d{5}$/;

/** Returns a map of field name -> inline error message; empty when the form is valid. */
export function validateRegistrationForm(
  values: RegistrationFormValues,
  otpSent: boolean,
): Record<string, string> {
  const errors: Record<string, string> = {};

  const cleanId = values.customerId.trim().toLowerCase();
  if (!cleanId) {
    errors.customerId = 'Customer ID is required.';
  } else if (cleanId.length < 3 || cleanId.length > 6) {
    errors.customerId = 'Customer ID must be between 3 and 6 characters.';
  }

  if (!values.companyName.trim()) errors.companyName = 'Company or shop name is required.';
  if (!values.city.trim()) errors.city = 'City is required.';
  if (!values.state.trim()) errors.state = 'State is required.';

  if (!values.pincode.trim()) {
    errors.pincode = 'Pincode is required.';
  } else if (!PINCODE_REGEX.test(values.pincode.trim())) {
    errors.pincode = 'Please enter a valid 6-digit pincode.';
  }

  if (!values.contactPerson.trim()) errors.contactPerson = 'Contact person name is required.';

  if (!values.mobileNumber) {
    errors.mobileNumber = 'Mobile number is required.';
  } else if (values.mobileNumber.length !== 10) {
    errors.mobileNumber = 'Please enter a valid 10-digit mobile number.';
  }

  if (!values.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!otpSent) {
    errors.otp = 'Please click "Send OTP" to verify your email first.';
  } else if (!values.otp.trim()) {
    errors.otp = 'Please enter the 6-digit verification code from your email.';
  } else if (values.otp.trim().length !== 6) {
    errors.otp = 'Verification code must be exactly 6 digits.';
  }

  return errors;
}

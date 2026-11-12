import { z } from 'zod';
import { BusinessType } from '../../shared';

export const CUSTOMER_ID = /^[a-z0-9]{3,6}$/;
const INDIAN_MOBILE = /^[6-9]\d{9}$/;
const PINCODE = /^[1-9]\d{5}$/;
const OTP = /^\d{6}$/;

const requiredText = (label: string, max = 120) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be at most ${max} characters`);

const baseSchema = z.object({
  customerId: z
    .string()
    .trim()
    .min(1, 'Customer ID is required')
    .regex(CUSTOMER_ID, 'Use 3 to 6 lower-case letters or numbers'),
  companyName: requiredText('Company / shop name'),
  city: requiredText('City', 80),
  state: requiredText('State', 80),
  pincode: z.string().trim().min(1, 'Pincode is required').regex(PINCODE, 'Enter a valid 6-digit pincode'),
  businessType: z.enum(BusinessType, { error: 'Choose your business type' }),
  contactPerson: requiredText('Contact person', 80),
  mobileNumber: z
    .string()
    .trim()
    .min(1, 'Mobile number is required')
    .regex(INDIAN_MOBILE, 'Enter a valid 10-digit mobile number starting with 6-9'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  /** Set by the page once the code has been emailed; not a visible field. */
  otpSent: z.boolean(),
  otp: z.string(),
});

/**
 * The OTP rule depends on whether a code was sent, so it is a cross-field rule.
 * `when` makes it run even while other fields are still invalid, so the OTP
 * message shows together with the rest on the first submit.
 */
export const registrationSchema = baseSchema.superRefine(
  (values, ctx) => {
    if (!values.otpSent) {
      ctx.addIssue({ code: 'custom', path: ['otp'], message: 'Send the verification code to your email first' });
    } else if (!OTP.test(values.otp)) {
      ctx.addIssue({ code: 'custom', path: ['otp'], message: 'Enter the 6-digit code from your email' });
    }
  },
  { when: (payload) => baseSchema.pick({ otpSent: true, otp: true }).safeParse(payload.value).success },
);

export type RegistrationFormInput = z.input<typeof registrationSchema>;
export type RegistrationFormValues = z.output<typeof registrationSchema>;

export const EMPTY_REGISTRATION_FORM: RegistrationFormInput = {
  customerId: '',
  companyName: '',
  city: '',
  state: '',
  pincode: '',
  businessType: BusinessType.TEXTILE_GARMENTS,
  contactPerson: '',
  mobileNumber: '',
  email: '',
  otpSent: false,
  otp: '',
};

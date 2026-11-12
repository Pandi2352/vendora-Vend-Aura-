import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../../lib/config';
import type { RequestEmailOtpDto, SubscriptionPlanCode } from '../../shared';

export const OTP_RESEND_SECONDS = 60;

/** Sends the email verification code and runs the resend countdown. */
export function useEmailOtp() {
  const [sessionId, setSessionId] = useState('');
  const [sending, setSending] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  /** Throws on failure so the caller can show the message under the email field. */
  const send = async (email: string, selectedPlanCode: SubscriptionPlanCode) => {
    setSending(true);
    try {
      const body: RequestEmailOtpDto = { email, selectedPlanCode };
      const res = await axios.post(`${API_BASE}/onboarding/request-otp`, body);
      setSessionId(res.data?.data?.sessionId ?? '');
      setResendIn(OTP_RESEND_SECONDS);
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setSessionId('');
    setResendIn(0);
  };

  return { sessionId, sending, resendIn, send, reset };
}

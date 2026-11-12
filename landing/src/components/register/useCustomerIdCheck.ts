import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../../lib/config';
import { getApiErrorMessage } from '../../lib/apiError';
import { CUSTOMER_ID } from './registrationSchema';

export interface CustomerIdStatus {
  /** The ID this result is for (ignore it once the user has typed something else). */
  id: string;
  available: boolean;
  message: string;
}

const DEBOUNCE_MS = 500;

/**
 * Live "is this Customer ID free?" check: runs automatically 500 ms after the
 * user stops typing a well-formed ID, and on demand (submit). Late answers for
 * an older value are dropped.
 */
export function useCustomerIdCheck(currentId: string) {
  const [status, setStatus] = useState<CustomerIdStatus | null>(null);
  const [checking, setChecking] = useState(false);
  const latest = useRef(currentId);
  latest.current = currentId;

  const check = useCallback(async (id: string): Promise<CustomerIdStatus> => {
    setChecking(true);
    try {
      const res = await axios.get(`${API_BASE}/onboarding/check-subdomain`, { params: { shopId: id } });
      const data = res.data?.data;
      const result: CustomerIdStatus = data?.isAvailable
        ? { id, available: true, message: data?.message || `"${id}" is available` }
        : { id, available: false, message: data?.reason || `"${id}" is already taken. Please choose another.` };
      if (latest.current === id) setStatus(result);
      return result;
    } catch (err) {
      const result = {
        id,
        available: false,
        message: getApiErrorMessage(err, 'Unable to check this Customer ID right now. Please try again.'),
      };
      if (latest.current === id) setStatus(result);
      return result;
    } finally {
      if (latest.current === id) setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (!CUSTOMER_ID.test(currentId)) {
      setChecking(false);
      return;
    }
    const timer = setTimeout(() => void check(currentId), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [currentId, check]);

  const current = status?.id === currentId ? status : null;

  /** Uses the cached answer for this ID when there is one, otherwise asks the server. */
  const ensure = useCallback(
    async (id: string) => (status?.id === id && !checking ? status : check(id)),
    [status, checking, check],
  );

  return { status: current, checking, ensure, reset: () => setStatus(null) };
}

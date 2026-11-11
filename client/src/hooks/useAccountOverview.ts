import { useCallback, useEffect, useState } from 'react';
import { api, unwrap, getErrorMessage } from '../lib/api';
import type { AccountOverview } from '../types/account.types';

/** Store profile, terminal, plan and usage (GET /account/overview). */
export function useAccountOverview() {
  const [data, setData] = useState<AccountOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      setData(unwrap<AccountOverview>(await api.get('/account/overview')));
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load store details.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, reload: load };
}

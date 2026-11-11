import { useSearchParams } from 'react-router-dom';
import { Alert, PageHeader, Tabs, type TabItem } from '../components/ui';
import { useAccountOverview } from '../hooks/useAccountOverview';
import { AppearanceCard } from './settings/AppearanceCard';
import { PosPreferencesCard } from './settings/PosPreferencesCard';
import { StoreProfileCard } from './settings/StoreProfileCard';
import { TerminalCard } from './settings/TerminalCard';
import { PlanUsageCard } from './settings/PlanUsageCard';

type SettingsTab = 'general' | 'pos' | 'store';

const TABS: TabItem<SettingsTab>[] = [
  { value: 'general', label: 'General' },
  { value: 'pos', label: 'POS' },
  { value: 'store', label: 'Store' },
];

/** Settings: device preferences on the left, terminal + plan on the right. Tab is kept in ?tab=. */
export function SettingsPage() {
  const [params, setParams] = useSearchParams();
  const tab = (TABS.find((t) => t.value === params.get('tab'))?.value ?? 'general') as SettingsTab;
  const account = useAccountOverview();

  return (
    <div className="p-4 sm:p-6">
      <PageHeader />
      <Tabs items={TABS} value={tab} onChange={(next) => setParams({ tab: next }, { replace: true })} className="mb-4" />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        <div className="space-y-4">
          {tab === 'general' && <AppearanceCard />}
          {tab === 'pos' && <PosPreferencesCard />}
          {tab === 'store' && account.data && <StoreProfileCard data={account.data} />}
        </div>

        <div className="space-y-4">
          {account.error && <Alert tone="error">{account.error}</Alert>}
          {account.isLoading && !account.data && (
            <div className="h-40 rounded-md border border-zinc-200 bg-white animate-pulse" aria-label="Loading" />
          )}
          {account.data && (
            <>
              <TerminalCard data={account.data} />
              <PlanUsageCard data={account.data} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

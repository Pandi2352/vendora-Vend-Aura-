import { ArrowClockwise } from '@phosphor-icons/react';
import { Alert, Button, PageHeader } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { usePosSession } from '../hooks/usePosSession';
import { canViewReports } from '../lib/permissions';
import { useDashboardData } from './dashboard/useDashboardData';
import { TodayStats } from './dashboard/TodayStats';
import { DrawerCard } from './dashboard/DrawerCard';
import { QuickActions } from './dashboard/QuickActions';
import { RecentBillsCard } from './dashboard/RecentBillsCard';
import { StockAlertsCard } from './dashboard/StockAlertsCard';

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
};

export function DashboardPage() {
  const { user } = useAuth();
  const { activeShift, refreshShift } = usePosSession();
  const canSeeReports = canViewReports(user?.role);
  const dashboard = useDashboardData(canSeeReports);

  const refresh = () => {
    dashboard.reload();
    refreshShift();
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <PageHeader
        actions={
          <Button
            size="sm"
            variant="secondary"
            onClick={refresh}
            disabled={dashboard.isLoading}
            icon={<ArrowClockwise className={`w-4 h-4 ${dashboard.isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        }
      />

      <div>
        <h1 className="text-xl font-extrabold text-zinc-900">
          {greeting()}, {user?.fullName?.split(' ')[0] || user?.username}
        </h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          {user?.businessName} ·{' '}
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {dashboard.failed.length > 0 && (
        <Alert tone="warning">Could not load {dashboard.failed.join(', ')}. Use Refresh to try again.</Alert>
      )}

      <TodayStats today={dashboard.today} shift={activeShift} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
        <div className="xl:col-span-2 space-y-4">
          <RecentBillsCard orders={dashboard.recentOrders} isLoading={dashboard.isLoading} />
          {dashboard.inventory && <StockAlertsCard inventory={dashboard.inventory} />}
        </div>
        <div className="space-y-4">
          <DrawerCard />
          <QuickActions canSeeReports={canSeeReports} />
        </div>
      </div>
    </div>
  );
}

import { ArrowClockwise, RocketLaunch, ArrowRight } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { Alert, Button, PageHeader } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { usePosSession } from '../hooks/usePosSession';
import { canViewReports } from '../lib/permissions';
import { ROUTES } from '../config/routes';
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

      {dashboard.recentOrders.length === 0 && (
        <div className="rounded-lg bg-slate-900 border border-slate-800 p-4 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-600/20 border border-primary-500/40 text-primary-400 flex items-center justify-center shrink-0">
              <RocketLaunch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Store Setup Guide</h3>
              <p className="text-xs text-slate-400">Complete your initial store setup checklist before your first bill.</p>
            </div>
          </div>
          <Link
            to={ROUTES.SETUP}
            className="px-3.5 py-1.5 rounded-md bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shrink-0"
          >
            <span>Open Setup Guide</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

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

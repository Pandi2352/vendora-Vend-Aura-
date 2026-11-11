import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { ReportsView, type ReportsTab } from '../components/reports/ReportsView';
import { ROUTES } from '../config/routes';

const TAB_ROUTES: Record<ReportsTab, string> = {
  overview: ROUTES.REPORTS_OVERVIEW,
  gst: ROUTES.REPORTS_GST,
  inventory: ROUTES.REPORTS_INVENTORY,
};

const isReportsTab = (value?: string): value is ReportsTab => !!value && value in TAB_ROUTES;

/** /reports/:tab — the tab lives in the URL so sidebar flyout links and refreshes keep it. */
export function ReportsPage() {
  const { tab } = useParams();
  const navigate = useNavigate();

  if (!isReportsTab(tab)) return <Navigate to={ROUTES.REPORTS_OVERVIEW} replace />;

  return (
    <div className="h-full flex flex-col">
      <ReportsView tab={tab} onTabChange={(next) => navigate(TAB_ROUTES[next])} />
    </div>
  );
}

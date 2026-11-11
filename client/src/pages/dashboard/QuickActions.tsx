import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowUDownLeft, UsersThree, ChartLineUp, Lightning } from '@phosphor-icons/react';
import { Card, CardHeader } from '../../components/ui';
import { usePosSession } from '../../hooks/usePosSession';
import { ROUTES } from '../../config/routes';

const tileClass =
  'flex flex-col items-start gap-2 p-3 rounded-md border border-zinc-200 bg-white hover:border-primary-600 hover:bg-primary-50 transition-colors text-left cursor-pointer';

export function QuickActions({ canSeeReports }: { canSeeReports: boolean }) {
  const { setOpenModal } = usePosSession();

  return (
    <Card>
      <CardHeader icon={<Lightning />} title="Quick actions" />
      <div className="grid grid-cols-2 gap-2">
        <Link to={ROUTES.POS} className={tileClass}>
          <ShoppingCart className="w-5 h-5 text-primary-600" />
          <span className="text-sm font-semibold text-zinc-900">New sale</span>
        </Link>
        <button type="button" onClick={() => setOpenModal('returns')} className={tileClass}>
          <ArrowUDownLeft className="w-5 h-5 text-primary-600" />
          <span className="text-sm font-semibold text-zinc-900">Sales return</span>
        </button>
        <Link to={ROUTES.CUSTOMERS} className={tileClass}>
          <UsersThree className="w-5 h-5 text-primary-600" />
          <span className="text-sm font-semibold text-zinc-900">Customers & khata</span>
        </Link>
        {canSeeReports && (
          <Link to={ROUTES.REPORTS_OVERVIEW} className={tileClass}>
            <ChartLineUp className="w-5 h-5 text-primary-600" />
            <span className="text-sm font-semibold text-zinc-900">Reports</span>
          </Link>
        )}
      </div>
    </Card>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowsClockwise, CaretRight } from '@phosphor-icons/react';
import { api, unwrap } from '../lib/api';
import { ROUTES } from '../config/routes';
import { SetupHeroBanner } from '../components/setup/SetupHeroBanner';
import { SetupStepItem, type SubMasterPill } from '../components/setup/SetupStepItem';
import { Spinner, Alert } from '../components/ui';

interface SetupStepData {
  stepNumber: number;
  title: string;
  description: string;
  count?: number;
  completed: boolean;
  isOptional?: boolean;
  subMasters?: SubMasterPill[];
  data?: Record<string, unknown>;
}

interface SetupChecklistData {
  storeName: string;
  ownerName: string;
  completedCount: number;
  totalSteps: number;
  percentage: number;
  isReadyToBill: boolean;
  steps: {
    shopDetails: SetupStepData;
    outlet: SetupStepData;
    itemMasters: SetupStepData;
    supplier: SetupStepData;
    item: SetupStepData;
    openingStock: SetupStepData;
    staff: SetupStepData;
    testBill: SetupStepData;
  };
}

export function SetupPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<SetupChecklistData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchChecklist = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError('');

    try {
      const res = await api.get('/account/setup-checklist');
      setData(unwrap<SetupChecklistData>(res));
    } catch {
      setError('Unable to load setup checklist. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchChecklist();
  }, [fetchChecklist]);

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
        <p className="text-xs text-zinc-500 mt-3 font-medium">Inspecting store setup milestones…</p>
      </div>
    );
  }

  const steps = data?.steps;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium select-none">
        <Link to={ROUTES.DASHBOARD} className="hover:text-zinc-900 transition-colors">
          Home
        </Link>
        <CaretRight className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-zinc-950 font-semibold">Setup</span>
      </nav>

      {error && <Alert tone="error">{error}</Alert>}

      {/* Hero Getting Started Card */}
      {data && (
        <SetupHeroBanner
          ownerName={data.ownerName}
          completedCount={data.completedCount}
          totalSteps={data.totalSteps}
          isReadyToBill={data.isReadyToBill}
        />
      )}

      {/* 8 Setup Steps Timeline */}
      {steps && (
        <div className="space-y-4 pt-2">
          {/* Step 1: Shop details */}
          <SetupStepItem
            stepNumber={1}
            title={steps.shopDetails.title}
            description={steps.shopDetails.description}
            count={steps.shopDetails.count}
            completed={steps.shopDetails.completed}
            actionLabel="View"
            onAction={() => navigate(ROUTES.SETTINGS)}
          />

          {/* Step 2: First outlet */}
          <SetupStepItem
            stepNumber={2}
            title={steps.outlet.title}
            description={steps.outlet.description}
            count={steps.outlet.count}
            completed={steps.outlet.completed}
            actionLabel="View"
            onAction={() => navigate(ROUTES.SETTINGS)}
          />

          {/* Step 3: Item masters */}
          <SetupStepItem
            stepNumber={3}
            title={steps.itemMasters.title}
            description={steps.itemMasters.description}
            count={steps.itemMasters.count}
            completed={steps.itemMasters.completed}
            subMasters={steps.itemMasters.subMasters}
            actionLabel="View"
            onAction={() => navigate(ROUTES.POS)}
          />

          {/* Step 4: First supplier */}
          <SetupStepItem
            stepNumber={4}
            title={steps.supplier.title}
            description={steps.supplier.description}
            count={steps.supplier.count}
            completed={steps.supplier.completed}
            actionLabel={steps.supplier.completed ? 'View' : 'Add supplier >'}
            onAction={() => navigate(ROUTES.SUPPLIERS)}
          />

          {/* Step 5: First item */}
          <SetupStepItem
            stepNumber={5}
            title={steps.item.title}
            description={steps.item.description}
            count={steps.item.count}
            completed={steps.item.completed}
            actionLabel={steps.item.completed ? 'View' : 'Add item >'}
            onAction={() => navigate(ROUTES.POS)}
          />

          {/* Step 6: Opening stock */}
          <SetupStepItem
            stepNumber={6}
            title={steps.openingStock.title}
            description={steps.openingStock.description}
            count={steps.openingStock.count}
            completed={steps.openingStock.completed}
            actionLabel="View"
            onAction={() => navigate(ROUTES.POS)}
          />

          {/* Step 7: Staff (Optional) */}
          <SetupStepItem
            stepNumber={7}
            title={steps.staff.title}
            description={steps.staff.description}
            completed={steps.staff.completed}
            isOptional
            actionLabel="Add staff >"
            onAction={() => navigate(ROUTES.SETTINGS)}
          />

          {/* Step 8: Ring a test bill */}
          <SetupStepItem
            stepNumber={8}
            title={steps.testBill.title}
            description={steps.testBill.description}
            completed={steps.testBill.completed}
            isHighlighted
            isLast
            actionLabel="Open POS >"
            onAction={() => navigate(ROUTES.POS)}
          />
        </div>
      )}

      {/* Live Data Footer Bar */}
      <div className="pt-4 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
        <p>The list reads straight from your data — it updates itself as you go.</p>
        <button
          type="button"
          onClick={() => fetchChecklist(true)}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-300 hover:bg-zinc-100 text-zinc-800 font-semibold cursor-pointer transition-colors"
        >
          <ArrowsClockwise className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Checking…' : 'Re-check'}</span>
        </button>
      </div>
    </div>
  );
}


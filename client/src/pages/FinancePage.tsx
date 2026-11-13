import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, ArrowsClockwise, Wallet, Scales, ChartLineUp } from '@phosphor-icons/react';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { FinanceKpiStrip } from '../components/finance/FinanceKpiStrip';
import { ExpensesTable } from '../components/finance/ExpensesTable';
import { RecordExpenseModal } from '../components/finance/RecordExpenseModal';
import { TrialBalanceTab } from '../components/finance/TrialBalanceTab';
import { ProfitLossTab } from '../components/finance/ProfitLossTab';
import type { ExpenseItem, TrialBalanceData, ProfitLossData } from '../components/finance/types';

type TabKey = 'expenses' | 'trial-balance' | 'profit-loss';

export function FinancePage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: TabKey =
    rawTab === 'trial-balance' || rawTab === 'profit-loss' ? rawTab : 'expenses';

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [trialBalance, setTrialBalance] = useState<TrialBalanceData | null>(null);
  const [profitLoss, setProfitLoss] = useState<ProfitLossData | null>(null);
  const [loading, setLoading] = useState(false);

  const primaryOutletId = user?.outletIds?.[0] || '';

  const handleTabChange = (nextTab: TabKey) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextTab === 'expenses') {
        next.delete('tab');
      } else {
        next.set('tab', nextTab);
      }
      return next;
    });
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [expRes, tbRes, plRes] = await Promise.all([
        api.get('/finance/expenses'),
        api.get('/finance/trial-balance'),
        api.get('/finance/profit-loss'),
      ]);

      const expData = expRes.data?.data;
      setExpenses(expData?.items || []);
      setTotalSpent(expData?.totalSpent || 0);

      setTrialBalance(tbRes.data?.data || null);
      setProfitLoss(plRes.data?.data || null);
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const cashSpent = expenses.filter((e) => e.paymentMode === 'CASH').reduce((s, e) => s + e.amount, 0);
  const digitalSpent = expenses.filter((e) => e.paymentMode !== 'CASH').reduce((s, e) => s + e.amount, 0);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">Accounts & Retail Finance</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Store overhead expenses, double-entry General Ledger (GL), and real-time P&L
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            title="Refresh finance data"
            className="p-2 border border-zinc-300 rounded-md hover:bg-zinc-100 text-zinc-700 cursor-pointer transition-colors"
          >
            <ArrowsClockwise className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="px-3.5 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-xs cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <Plus weight="bold" className="w-3.5 h-3.5" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <FinanceKpiStrip
        totalSpent={totalSpent}
        expensesCount={expenses.length}
        cashSpent={cashSpent}
        digitalSpent={digitalSpent}
        netProfit={profitLoss?.netProfit}
      />

      {/* Segmented Navigation Switcher */}
      <div className="border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTabChange('expenses')}
            className={`px-3 py-2 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'expenses'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Wallet weight="bold" className="w-3.5 h-3.5" />
            <span>Store Expenses ({expenses.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('trial-balance')}
            className={`px-3 py-2 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'trial-balance'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Scales weight="bold" className="w-3.5 h-3.5" />
            <span>Trial Balance (GL)</span>
          </button>

          <button
            onClick={() => handleTabChange('profit-loss')}
            className={`px-3 py-2 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'profit-loss'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <ChartLineUp weight="bold" className="w-3.5 h-3.5" />
            <span>Profit & Loss (P&L)</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'expenses' && <ExpensesTable expenses={expenses} loading={loading} onRefresh={fetchData} />}
      {activeTab === 'trial-balance' && <TrialBalanceTab data={trialBalance} loading={loading} />}
      {activeTab === 'profit-loss' && <ProfitLossTab data={profitLoss} loading={loading} />}

      {/* Record Expense Modal */}
      <RecordExpenseModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSuccess={fetchData}
        outletId={primaryOutletId}
      />
    </div>
  );
}


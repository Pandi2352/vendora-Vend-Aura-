import { CurrencyInr, Receipt, ChartBar, Percent, Money, QrCode, CreditCard } from '@phosphor-icons/react';
import { StatTile } from '../../components/ui';
import { formatInr } from '../../lib/format';
import type { ExecutiveOverviewData } from '../../types/reports.types';
import type { ShiftSummary } from '../../types/shift-return.types';

interface TodayStatsProps {
  today: ExecutiveOverviewData | null;
  shift: ShiftSummary | null;
}

/** Owners / managers see today's report totals; cashiers see their open shift. */
export function TodayStats({ today, shift }: TodayStatsProps) {
  if (today) {
    const s = today.summary;
    return (
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatTile label="Net sales today" value={formatInr(s.netSales)} hint={`Gross ${formatInr(s.grossSales)}`} icon={<CurrencyInr />} />
        <StatTile label="Bills today" value={s.ordersCount} icon={<Receipt />} />
        <StatTile label="Average bill" value={formatInr(s.avgOrderValue)} icon={<ChartBar />} />
        <StatTile label="Gross margin" value={`${s.grossMarginPercent.toFixed(1)}%`} hint="estimated" icon={<Percent />} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <StatTile label="Bills this shift" value={shift?.billsCount ?? 0} icon={<Receipt />} />
      <StatTile label="Cash sales" value={formatInr(shift?.cashSalesTotal ?? 0)} icon={<Money />} />
      <StatTile label="UPI sales" value={formatInr(shift?.upiSalesTotal ?? 0)} icon={<QrCode />} />
      <StatTile label="Card sales" value={formatInr(shift?.cardSalesTotal ?? 0)} icon={<CreditCard />} />
    </div>
  );
}

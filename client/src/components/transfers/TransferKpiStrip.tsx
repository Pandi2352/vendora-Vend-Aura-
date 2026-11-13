interface TransferSummaryProps {
  summary: {
    total: number;
    pending: number;
    dispatched: number;
    received: number;
    cancelled: number;
  };
}

export function TransferKpiStrip({ summary }: TransferSummaryProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      <div className="p-3 bg-white border border-zinc-200 rounded-md">
        <span className="text-[0.6875rem] font-bold text-zinc-500 uppercase tracking-wider block">Total STN Requests</span>
        <span className="text-xl font-black font-mono text-zinc-950 mt-0.5 block">{summary.total}</span>
        <span className="text-[0.625rem] text-zinc-400 font-mono">All Time Movements</span>
      </div>
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
        <span className="text-[0.6875rem] font-bold text-amber-700 uppercase tracking-wider block">Pending Dispatch</span>
        <span className="text-xl font-black font-mono text-amber-800 mt-0.5 block">{summary.pending}</span>
        <span className="text-[0.625rem] text-amber-600 font-mono">Awaiting Source Exit</span>
      </div>
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
        <span className="text-[0.6875rem] font-bold text-blue-700 uppercase tracking-wider block">In Transit</span>
        <span className="text-xl font-black font-mono text-blue-800 mt-0.5 block">{summary.dispatched}</span>
        <span className="text-[0.625rem] text-blue-600 font-mono">Dispatched on Road</span>
      </div>
      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md">
        <span className="text-[0.6875rem] font-bold text-emerald-700 uppercase tracking-wider block">Completed</span>
        <span className="text-xl font-black font-mono text-emerald-800 mt-0.5 block">{summary.received}</span>
        <span className="text-[0.625rem] text-emerald-600 font-mono">Acknowledged & Stocked</span>
      </div>
    </div>
  );
}


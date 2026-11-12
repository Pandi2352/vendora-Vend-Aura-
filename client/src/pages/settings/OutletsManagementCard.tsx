import { useState, useEffect, useCallback } from 'react';
import { Storefront, Plus, ArrowsLeftRight, CheckCircle, Clock, Phone } from '@phosphor-icons/react';
import { Card, CardHeader } from '../../components/ui';
import { api } from '../../lib/api';
import { Spinner } from '../../components/ui/Spinner';

interface OutletItem {
  _id: string;
  name: string;
  code: string;
  isPrimary: boolean;
  phone?: string;
  email?: string;
  address?: { city?: string; state?: string };
}

interface TransferItem {
  id: string;
  transferNumber: string;
  sourceOutletName: string;
  destinationOutletName: string;
  status: string;
  dispatchDate: string;
  receivedDate?: string;
  items: Array<{ productName: string; quantity: number }>;
}

export function OutletsManagementCard() {
  const [outlets, setOutlets] = useState<OutletItem[]>([]);
  const [transfers, setTransfers] = useState<TransferItem[]>([]);
  const [receivingId, setReceivingId] = useState<string | null>(null);

  // New Outlet Modal State
  const [isAddOutletOpen, setIsAddOutletOpen] = useState(false);
  const [outletName, setOutletName] = useState('');
  const [outletCode, setOutletCode] = useState('');
  const [outletPhone, setOutletPhone] = useState('');
  const [addOutletError, setAddOutletError] = useState<string | null>(null);
  const [isSubmittingOutlet, setIsSubmittingOutlet] = useState(false);

  const fetchOutlets = useCallback(async () => {
    try {
      const [outletsRes, transfersRes] = await Promise.all([
        api.get('/outlets'),
        api.get('/outlets/transfers'),
      ]);
      setOutlets(outletsRes.data?.data || []);
      setTransfers(transfersRes.data?.data || []);
    } catch {
      // Ignored
    }
  }, []);

  useEffect(() => {
    fetchOutlets();
  }, [fetchOutlets]);

  const handleCreateOutlet = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingOutlet(true);
    setAddOutletError(null);
    try {
      await api.post('/outlets', {
        name: outletName.trim(),
        code: outletCode.trim().toUpperCase(),
        phone: outletPhone.trim(),
      });
      setIsAddOutletOpen(false);
      setOutletName('');
      setOutletCode('');
      setOutletPhone('');
      fetchOutlets();
    } catch (err: any) {
      setAddOutletError(err?.response?.data?.message || 'Could not add branch. Check your plan limit.');
    } finally {
      setIsSubmittingOutlet(false);
    }
  };

  const handleReceiveTransfer = async (id: string) => {
    setReceivingId(id);
    try {
      await api.patch(`/outlets/transfers/${id}/receive`);
      fetchOutlets();
    } catch {
      // Ignored
    } finally {
      setReceivingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Outlets List Card */}
      <Card>
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <CardHeader icon={<Storefront />} title="Store Locations & Outlets" />
          <button
            onClick={() => setIsAddOutletOpen(true)}
            className="px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-xs cursor-pointer transition-colors flex items-center gap-1"
          >
            <Plus weight="bold" className="w-3.5 h-3.5" />
            <span>Add Outlet</span>
          </button>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {outlets.map((o) => (
            <div key={o._id} className="p-3 rounded-md bg-zinc-50 border border-zinc-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-950 text-sm">{o.name}</span>
                {o.isPrimary ? (
                  <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold">
                    Primary / Head Office
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-zinc-200 text-zinc-700 text-[10px] font-bold">
                    Branch Location
                  </span>
                )}
              </div>
              <p className="font-mono text-zinc-500 text-[11px]">Code: {o.code}</p>
              {o.phone && (
                <p className="flex items-center gap-1.5 text-zinc-600 text-[11px]">
                  <Phone className="w-3 h-3 text-zinc-400" />
                  <span>{o.phone}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* 2. Stock Transfers Card */}
      <Card>
        <CardHeader icon={<ArrowsLeftRight />} title="Inter-Store Stock Transfers (STN)" />
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-100/75 border-b border-zinc-200 text-zinc-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2 px-3">STN Number</th>
                <th className="py-2 px-3">Source & Destination</th>
                <th className="py-2 px-3">Items Qty</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-zinc-400">
                    No inter-branch transfers recorded yet.
                  </td>
                </tr>
              ) : (
                transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-50/75">
                    <td className="py-2.5 px-3 font-mono font-bold text-zinc-950">{t.transferNumber}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-zinc-900 font-medium">{t.sourceOutletName}</span>
                      <span className="text-zinc-400 mx-1.5">➔</span>
                      <span className="text-zinc-900 font-medium">{t.destinationOutletName}</span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-zinc-800">
                      {t.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0} units
                    </td>
                    <td className="py-2.5 px-3">
                      {t.status === 'RECEIVED' ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold inline-flex items-center gap-1">
                          <CheckCircle weight="fill" className="w-3 h-3 text-emerald-600" /> Received
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold inline-flex items-center gap-1">
                          <Clock weight="fill" className="w-3 h-3 text-blue-600" /> In-Transit
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {t.status === 'IN_TRANSIT' && (
                        <button
                          onClick={() => handleReceiveTransfer(t.id)}
                          disabled={receivingId === t.id}
                          className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-[11px] cursor-pointer"
                        >
                          {receivingId === t.id ? 'Receiving…' : 'Acknowledge Receipt'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Outlet Modal */}
      {isAddOutletOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-md max-w-sm w-full p-5 space-y-3 text-xs">
            <h4 className="font-bold text-sm text-zinc-950">Add New Branch Location</h4>
            {addOutletError && (
              <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-700 font-medium">
                {addOutletError}
              </div>
            )}
            <form onSubmit={handleCreateOutlet} className="space-y-3">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Branch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. West End Branch"
                  value={outletName}
                  onChange={(e) => setOutletName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-zinc-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Branch Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OUT-02"
                  value={outletCode}
                  onChange={(e) => setOutletCode(e.target.value)}
                  className="w-full px-3 py-1.5 border border-zinc-300 rounded-md uppercase"
                />
              </div>
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +91 9876543210"
                  value={outletPhone}
                  onChange={(e) => setOutletPhone(e.target.value)}
                  className="w-full px-3 py-1.5 border border-zinc-300 rounded-md"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOutletOpen(false)}
                  className="px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOutlet}
                  className="px-3.5 py-1.5 rounded-md bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold flex items-center gap-1.5"
                >
                  {isSubmittingOutlet && <Spinner size="sm" />}
                  <span>Add Branch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

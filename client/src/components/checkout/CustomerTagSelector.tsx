import { useState } from 'react';
import { User } from '@phosphor-icons/react';
import type { CustomerItem } from '../../types/pos.types';

interface CustomerTagSelectorProps {
  customers: CustomerItem[];
  selectedCustomer: CustomerItem | null;
  onSelectCustomer: (c: CustomerItem | null) => void;
}

export function CustomerTagSelector({
  customers,
  selectedCustomer,
  onSelectCustomer,
}: CustomerTagSelectorProps) {
  const [customerSearch, setCustomerSearch] = useState('');

  const filteredCustomerList = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch)
  );

  return (
    <div className="p-3 bg-zinc-50 rounded-md border border-zinc-200 text-xs space-y-2 font-sans">
      <div className="flex items-center justify-between">
        <span className="font-bold text-zinc-800 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-zinc-500" />
          <span>Customer Profile (Required for Khata Credit)</span>
        </span>
        {selectedCustomer && (
          <button
            type="button"
            onClick={() => onSelectCustomer(null)}
            className="text-red-600 hover:text-red-700 font-semibold text-[11px] cursor-pointer"
          >
            Detach
          </button>
        )}
      </div>

      {selectedCustomer ? (
        <div className="flex items-center justify-between bg-white p-2.5 rounded-md border border-zinc-200 font-mono">
          <div>
            <span className="font-bold font-sans text-zinc-950 text-xs block">{selectedCustomer.name}</span>
            <span className="text-zinc-500 text-[11px]">Mob: {selectedCustomer.phone}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block uppercase">Khata Balance</span>
            <span
              className={`font-bold text-xs ${
                selectedCustomer.currentCreditBalance > 0 ? 'text-red-600' : 'text-emerald-600'
              }`}
            >
              ₹{selectedCustomer.currentCreditBalance.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <input
            type="text"
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            placeholder="Type customer name or mobile number (e.g. 9840...)"
            className="w-full px-3 py-1.5 rounded-md border border-zinc-300 focus:border-primary-600 outline-none text-xs bg-white"
          />

          {customerSearch.trim() && (
            <div className="max-h-28 overflow-y-auto border border-zinc-200 rounded-md bg-white divide-y divide-zinc-100">
              {filteredCustomerList.slice(0, 4).map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => {
                    onSelectCustomer(c);
                    setCustomerSearch('');
                  }}
                  className="w-full p-2 hover:bg-red-50 cursor-pointer flex justify-between items-center text-xs text-left"
                >
                  <span>
                    <span className="font-bold text-zinc-900">{c.name}</span>
                    <span className="text-zinc-400 font-mono text-[11px] ml-2">{c.phone}</span>
                  </span>
                  <span className="font-mono text-zinc-500 text-[11px]">
                    Khata: ₹{c.currentCreditBalance}
                  </span>
                </button>
              ))}
              {filteredCustomerList.length === 0 && (
                <div className="p-2 text-center text-zinc-400 text-xs">
                  No matching customer found.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


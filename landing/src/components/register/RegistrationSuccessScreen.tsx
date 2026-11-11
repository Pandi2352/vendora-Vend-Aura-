import { CheckCircle, ArrowSquareOut } from '@phosphor-icons/react';

interface CreatedAccountData {
  shopId: string;
  username: string;
  loginUrl: string;
  temporaryPassword?: string;
  planName: string;
}

interface RegistrationSuccessScreenProps {
  data: CreatedAccountData;
  onRegisterAnother: () => void;
}

export function RegistrationSuccessScreen({
  data,
  onRegisterAnother,
}: RegistrationSuccessScreenProps) {
  return (
    <div className="py-6 text-center font-sans">
      <div className="w-16 h-16 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-5">
        <CheckCircle weight="fill" className="w-10 h-10" />
      </div>

      <h2 className="text-2xl font-black text-zinc-950 tracking-tight">
        Your Vendora RetailPOS Account is Ready!
      </h2>
      <p className="text-sm text-zinc-600 mt-2 max-w-md mx-auto">
        We've provisioned your dedicated store instance with preloaded master catalog items and sample inventory.
      </p>

      <div className="mt-8 p-6 rounded-md bg-zinc-50 border border-zinc-200 text-left max-w-lg mx-auto space-y-3.5">
        <div className="flex justify-between items-center text-sm border-b border-zinc-200 pb-2.5">
          <span className="text-zinc-500 font-medium">Customer / Shop ID:</span>
          <span className="font-mono font-bold text-zinc-950 text-base">{data.shopId}</span>
        </div>

        <div className="flex justify-between items-center text-sm border-b border-zinc-200 pb-2.5">
          <span className="text-zinc-500 font-medium">Login Username:</span>
          <span className="font-mono font-bold text-zinc-950 text-base">{data.username}</span>
        </div>

        {data.temporaryPassword && (
          <div className="flex justify-between items-center text-sm border-b border-zinc-200 pb-2.5">
            <span className="text-zinc-500 font-medium">Temporary Password:</span>
            <span className="font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
              {data.temporaryPassword}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-sm">
          <span className="text-zinc-500 font-medium">Selected Plan:</span>
          <span className="font-bold text-zinc-950">{data.planName}</span>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <a
          href="http://localhost:4001"
          target="_blank"
          rel="noreferrer"
          className="w-full sm:w-auto px-8 py-3.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Open Store Counter (Port 4001)</span>
          <ArrowSquareOut weight="bold" className="w-4 h-4" />
        </a>

        <button
          onClick={onRegisterAnother}
          className="w-full sm:w-auto px-6 py-3.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold text-sm transition-all border border-zinc-200 cursor-pointer"
        >
          Register Another Shop
        </button>
      </div>
    </div>
  );
}


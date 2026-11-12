import { CheckCircle, ArrowSquareOut, EnvelopeSimple } from '@phosphor-icons/react';
import type { CompleteRegistrationResult } from '../../shared';

interface CreatedAccountData extends CompleteRegistrationResult {
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

        <div className="flex justify-between items-center gap-3 text-sm border-b border-zinc-200 pb-2.5">
          <span className="text-zinc-500 font-medium shrink-0">Store Address:</span>
          <a
            href={data.loginUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono font-bold text-blue-700 hover:underline truncate"
          >
            {new URL(data.loginUrl).host}
          </a>
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

      <p className="mt-4 max-w-lg mx-auto p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left flex items-start gap-2">
        <EnvelopeSimple weight="fill" className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
        <span>
          These login details have also been emailed to you. You will be asked to change the temporary
          password the first time you sign in.
        </span>
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <a
          href={data.loginUrl}
          target="_blank"
          rel="noreferrer"
          className="w-full sm:w-auto px-8 py-3.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Open Store Counter</span>
          <ArrowSquareOut weight="bold" className="w-4 h-4" />
        </a>

        <button
          type="button"
          onClick={onRegisterAnother}
          className="w-full sm:w-auto px-6 py-3.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold text-sm transition-all border border-zinc-200 cursor-pointer"
        >
          Register Another Shop
        </button>
      </div>
    </div>
  );
}

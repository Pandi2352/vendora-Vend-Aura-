import { MsIcon } from '@/components/ui/MsIcon';

/** Placeholder for a Master section whose screen is not built yet. */
export function ComingSoonPanel({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-md border border-dashed border-zinc-300 p-10 text-center select-none">
      <span className="w-10 h-10 mx-auto rounded-md bg-primary-50 border border-primary-200 text-primary-600 inline-flex items-center justify-center">
        <MsIcon name="construction" className="text-[1.25rem]" />
      </span>
      <p className="mt-3 text-sm font-bold text-zinc-800">{title}</p>
      <p className="text-xs text-zinc-500 mt-1">This section is coming soon.</p>
    </div>
  );
}

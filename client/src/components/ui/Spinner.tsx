import { cn } from './cn';

const SIZES = { sm: 'w-3.5 h-3.5 border-2', md: 'w-5 h-5 border-2', lg: 'w-8 h-8 border-[3px]' } as const;

interface SpinnerProps {
  size?: keyof typeof SIZES;
  className?: string;
  /** Accessible text; omit when a visible label already says "Saving…". */
  label?: string;
}

export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  return (
    <span
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn('inline-block rounded-full border-current border-r-transparent animate-spin motion-reduce:animate-none', SIZES[size], className)}
    />
  );
}

/** Centered loader for a whole page or panel. */
export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="h-full min-h-48 flex flex-col items-center justify-center gap-3 text-zinc-400">
      <Spinner size="lg" className="text-primary-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

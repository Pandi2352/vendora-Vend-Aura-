import { cn } from './cn';

/** Loading placeholder block. Size it with className (h-4 w-32, h-40 w-full…). */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('rounded-md bg-zinc-200/70 animate-pulse motion-reduce:animate-none', className)} />;
}

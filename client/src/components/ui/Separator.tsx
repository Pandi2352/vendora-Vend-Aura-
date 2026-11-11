import { cn } from './cn';

export function Separator({ orientation = 'horizontal', className }: { orientation?: 'horizontal' | 'vertical'; className?: string }) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn('bg-zinc-200 shrink-0', orientation === 'horizontal' ? 'h-px w-full' : 'w-px self-stretch', className)}
    />
  );
}

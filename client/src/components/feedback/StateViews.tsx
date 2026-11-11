import type { ReactNode } from 'react';
import { MagnifyingGlass, WarningCircle, WifiSlash } from '@phosphor-icons/react';
import { Button } from '../ui/Button';
import { cn } from '../ui/cn';

interface StateViewProps {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

function StateView({ icon, title, description, action, className }: StateViewProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center gap-2 px-6 py-10', className)}>
      {icon && <span className="mb-1 text-zinc-300 [&>svg]:w-10 [&>svg]:h-10">{icon}</span>}
      <p className="text-sm font-semibold text-zinc-800">{title}</p>
      {description && <p className="text-xs text-zinc-500 max-w-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Nothing to show yet (empty list, no search results). */
export function EmptyState({ title = 'Nothing here yet', ...rest }: Partial<StateViewProps>) {
  return <StateView icon={<MagnifyingGlass />} title={title} {...rest} />;
}

/** A request failed; optional retry. */
export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
  className,
}: { title?: string; description?: ReactNode; onRetry?: () => void; className?: string }) {
  return (
    <StateView
      icon={<WarningCircle className="text-red-300" />}
      title={title}
      description={description}
      className={className}
      action={
        onRetry && (
          <Button size="sm" variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        )
      }
    />
  );
}

/** Browser is offline. */
export function NetworkErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <StateView
      icon={<WifiSlash />}
      title="You are offline"
      description="Check the internet connection. Your work on this screen is kept."
      action={
        onRetry && (
          <Button size="sm" variant="secondary" onClick={onRetry}>
            Retry
          </Button>
        )
      }
    />
  );
}

import type { ReactNode } from 'react';
import { cn } from './cn';
import { IconBadge } from './IconBadge';

interface CardProps {
  children: ReactNode;
  className?: string;
}

/** Bordered surface. No shadows anywhere in the app. */
export function Card({ children, className }: CardProps) {
  return <section className={cn('bg-white border border-zinc-200 rounded-md p-4', className)}>{children}</section>;
}

interface CardHeaderProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function CardHeader({ icon, title, description, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && <IconBadge>{icon}</IconBadge>}
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold text-zinc-900 truncate">{title}</h2>
          {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

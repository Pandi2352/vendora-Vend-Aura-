import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CaretRight } from '@phosphor-icons/react';
import { breadcrumbTrail } from '../../config/navigation';
import { ROUTES } from '../../config/routes';

interface PageHeaderProps {
  /** Overrides the last breadcrumb / page title. */
  title?: string;
  actions?: ReactNode;
}

/** Breadcrumbs (Home > Section > Page) derived from the navigation config, plus page actions. */
export function PageHeader({ title, actions }: PageHeaderProps) {
  const { pathname } = useLocation();
  const trail = breadcrumbTrail(pathname);
  if (title) trail.splice(Math.max(trail.length - 1, 0), 1, title);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
        <Link to={ROUTES.DASHBOARD} className="text-zinc-400 hover:text-zinc-600">
          Home
        </Link>
        {trail.map((label, i) => (
          <span key={label} className="flex items-center gap-1.5">
            <CaretRight className="w-3 h-3 text-zinc-400" aria-hidden />
            <span className={i === trail.length - 1 ? 'font-semibold text-zinc-700' : 'text-zinc-400'}>{label}</span>
          </span>
        ))}
      </nav>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { ShieldWarning, WarningOctagon } from '@phosphor-icons/react';
import { ROUTES } from '../config/routes';

function StatusPage({ code, title, message, icon }: { code: string; title: string; message: string; icon: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
      <span className="text-zinc-300 [&>svg]:w-12 [&>svg]:h-12">{icon}</span>
      <p className="text-4xl font-black text-zinc-200">{code}</p>
      <p className="text-base font-bold text-zinc-800">{title}</p>
      <p className="text-sm text-zinc-500 max-w-md">{message}</p>
      <div className="flex gap-2 mt-2">
        <Link to={ROUTES.DASHBOARD} className="h-10 px-4 inline-flex items-center rounded-md bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700">
          Go to dashboard
        </Link>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="h-10 px-4 inline-flex items-center rounded-md border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
        >
          Reload
        </button>
      </div>
    </div>
  );
}

/** 403 — signed in, but the role may not open this page. */
export function UnauthorizedPage() {
  return (
    <StatusPage
      code="403"
      icon={<ShieldWarning />}
      title="You don't have access to this page"
      message="Ask the store owner or manager if you need access."
    />
  );
}

/** Route-level error element: a crash inside one page does not blank the whole app. */
export function RouteErrorPage() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  if (import.meta.env.DEV) console.error(error);

  return notFound ? (
    <StatusPage code="404" icon={<WarningOctagon />} title="Page not found" message="This page does not exist." />
  ) : (
    <StatusPage
      code="500"
      icon={<WarningOctagon />}
      title="Something went wrong on this page"
      message="The rest of the app still works. Reload the page or go back to the dashboard."
    />
  );
}

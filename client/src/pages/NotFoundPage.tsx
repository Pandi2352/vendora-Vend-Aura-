import { Link } from 'react-router-dom';
import { ROUTES } from '../config/routes';

export function NotFoundPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-5xl font-black text-zinc-200">404</p>
      <p className="text-sm font-semibold text-zinc-700">This page does not exist.</p>
      <Link to={ROUTES.DASHBOARD} className="text-sm font-semibold text-primary-600 hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

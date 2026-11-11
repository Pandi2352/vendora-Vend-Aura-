import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

/** Last-resort boundary around the whole app (route errors are handled per page). */
export class ErrorBoundary extends Component<Props, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      this.props.fallback ?? (
        <div role="alert" className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 text-center bg-zinc-50">
          <p className="text-base font-bold text-zinc-800">The app hit an unexpected error.</p>
          <p className="text-sm text-zinc-500">Reload to continue. Saved bills are not affected.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="h-10 px-4 rounded-md bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 cursor-pointer"
          >
            Reload
          </button>
        </div>
      )
    );
  }
}

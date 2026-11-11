import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import { PreferencesProvider } from './providers/PreferencesProvider';
import { router } from './router';
import { ConfirmProvider, ToastProvider } from '../components/feedback';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <PreferencesProvider>
        <ToastProvider>
          <ConfirmProvider>
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </ConfirmProvider>
        </ToastProvider>
      </PreferencesProvider>
    </ErrorBoundary>
  );
}

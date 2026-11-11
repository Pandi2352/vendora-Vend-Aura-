import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import { PreferencesProvider } from './providers/PreferencesProvider';
import { router } from './router';

export function App() {
  return (
    <PreferencesProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </PreferencesProvider>
  );
}

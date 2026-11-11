import { useNavigate } from 'react-router-dom';
import { PasswordResetModal } from '@/components/PasswordResetModal';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { ROUTES } from '@/config/routes';
import type { ChangePasswordValues } from '@/validations/auth';

/** Forced first-login password change; continues to the dashboard. */
export function ChangePasswordPage() {
  const { temporaryPassword, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Errors thrown here are shown on the form by <Form>.
  const handleSubmit = async ({ currentPassword, newPassword }: ChangePasswordValues) => {
    await changePassword(currentPassword, newPassword);
    toast.success('Password updated', 'Use your new password next time you sign in.');
    navigate(ROUTES.DASHBOARD, { replace: true });
  };

  return (
    <div className="h-screen bg-zinc-100">
      <PasswordResetModal initialCurrentPassword={temporaryPassword} onSubmit={handleSubmit} onSignOut={logout} />
    </div>
  );
}

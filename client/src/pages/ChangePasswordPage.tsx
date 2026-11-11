import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PasswordResetModal } from '../components/PasswordResetModal';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../lib/api';
import { ROUTES } from '../config/routes';

const MIN_PASSWORD_LENGTH = 8;

/** Forced first-login password change; continues to the dashboard. */
export function ChangePasswordPage() {
  const { temporaryPassword, changePassword, logout } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState(temporaryPassword);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!currentPassword) return setError('Please enter your current (temporary) password');
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return setError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
    }
    if (newPassword !== confirmPassword) return setError('Passwords do not match');

    setIsSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update password. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen bg-zinc-100">
      <PasswordResetModal
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        passwordError={error}
        isUpdatingPassword={isSaving}
        onSubmit={handleSubmit}
        onSignOut={logout}
      />
    </div>
  );
}

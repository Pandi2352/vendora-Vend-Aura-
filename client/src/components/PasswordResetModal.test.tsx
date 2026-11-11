import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordResetModal } from './PasswordResetModal';

describe('PasswordResetModal', () => {
  it('requires the current password when leaving it empty', async () => {
    const user = userEvent.setup();
    render(<PasswordResetModal onSubmit={vi.fn()} />);
    await user.click(screen.getByLabelText(/^Current/));
    await user.tab();
    expect(await screen.findByText('Current password is required')).toBeInTheDocument();
  });

  it('checks strength, a different new password and a matching confirmation', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PasswordResetModal initialCurrentPassword="temp1234" onSubmit={onSubmit} />);
    const next = screen.getByLabelText(/^New password/);
    await user.type(next, 'short');
    await user.tab();
    expect(await screen.findByText('New password must be at least 8 characters')).toBeInTheDocument();

    await user.clear(next);
    await user.type(next, 'temp1234');
    await user.type(screen.getByLabelText(/^Confirm/), 'temp1234');
    await user.click(screen.getByRole('button', { name: /Save & Enter/ }));
    expect(await screen.findByText('New password must be different from the current password')).toBeInTheDocument();

    await user.clear(next);
    await user.type(next, 'perm12345');
    await user.click(screen.getByRole('button', { name: /Save & Enter/ }));
    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the current and new password', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<PasswordResetModal initialCurrentPassword="temp1234" onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText(/^New password/), 'perm12345');
    await user.type(screen.getByLabelText(/^Confirm/), 'perm12345');
    await user.click(screen.getByRole('button', { name: /Save & Enter/ }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        currentPassword: 'temp1234',
        newPassword: 'perm12345',
        confirmPassword: 'perm12345',
      }),
    );
  });
});

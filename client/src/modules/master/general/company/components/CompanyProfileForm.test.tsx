import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompanyProfileForm } from './CompanyProfileForm';

const setup = (onSave = vi.fn()) => {
  const user = userEvent.setup();
  render(
    <CompanyProfileForm
      initialValues={{ companyName: 'Test shop 2', addressLine1: '12 Main Road', city: 'Sivakasi' }}
      shopId="tst02"
      updatedOn="2026-11-12"
      updatedBy="signup"
      onSave={onSave}
    />,
  );
  const nav = () => within(screen.getByRole('navigation', { name: 'Company profile sections' }));
  return { user, onSave, nav };
};

describe('CompanyProfileForm', () => {
  it('moves between sections and keeps what was typed', async () => {
    const { user, nav } = setup();
    expect(screen.getByLabelText(/Company name/)).toHaveValue('Test shop 2');

    await user.click(nav().getByRole('button', { name: /Contact & tax/ }));
    await user.type(screen.getByLabelText(/^Fax/), '0442345');
    await user.click(nav().getByRole('button', { name: /Locale & bill/ }));
    expect(screen.getByLabelText(/Currency sign/)).toHaveValue('₹');
    await user.click(nav().getByRole('button', { name: /Contact & tax/ }));
    expect(screen.getByLabelText(/^Fax/)).toHaveValue('0442345');
    expect(screen.getByText('1 unsaved change')).toBeInTheDocument();
  }, 15000);

  it('opens the section with the problem when saving fails validation', async () => {
    const { user, onSave, nav } = setup();
    await user.click(nav().getByRole('button', { name: /Contact & tax/ }));
    await user.type(screen.getByLabelText(/GSTIN/, { selector: 'input' }), 'BAD123');
    await user.click(nav().getByRole('button', { name: /Identity/ }));
    await user.clear(screen.getByLabelText(/Company code/));

    await user.click(screen.getByRole('button', { name: /save changes/i }));
    expect(await screen.findByText('Company code is required')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText(/Company code/)).toHaveFocus());
    expect(nav().getByRole('button', { name: /Identity/ })).toHaveTextContent('1 to fix');
    expect(nav().getByRole('button', { name: /Contact & tax/ })).toHaveTextContent('1 to fix');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('saves every section and clears the unsaved state', async () => {
    const { user, onSave } = setup();
    await user.type(screen.getByLabelText(/PIN code/), '626123');
    await user.click(screen.getByRole('button', { name: /save changes/i }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toMatchObject({
      companyCode: 'CMP-01',
      companyName: 'Test shop 2',
      postalCode: '626123',
      currency: 'INR',
      cashRounding: 'none',
      roundOff: true,
    });
    await waitFor(() => expect(screen.queryByText(/unsaved change/)).not.toBeInTheDocument());
  });
});

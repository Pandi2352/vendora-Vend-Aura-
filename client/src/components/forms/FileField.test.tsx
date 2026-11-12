import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { fileRule } from '@/validations/files';
import { Form } from './Form';
import { useAppForm } from './useAppForm';
import { FileField } from './FileField';

const makeFile = (name: string, type: string, size = 1024) => new File([new Uint8Array(size)], name, { type });

function MultiForm({ onSubmit = vi.fn() }: { onSubmit?: (v: { docs: File[] }) => void }) {
  const form = useAppForm(z.object({ docs: fileRule({ label: 'Documents', required: true, maxFiles: 2 }) }), {
    defaultValues: { docs: [] },
  });
  return (
    <Form form={form} onSubmit={onSubmit}>
      <FileField name="docs" label="Documents" required multiple maxFiles={2} accept={['image/*', '.pdf']} maxBytes={2 * 1024 * 1024} />
      <button type="submit">Save</button>
    </Form>
  );
}

function SingleForm({ onSubmit = vi.fn() }: { onSubmit?: (v: { logo: File | null }) => void }) {
  const form = useAppForm(z.object({ logo: fileRule.single({ label: 'Logo', required: true }) }), {
    defaultValues: { logo: null },
  });
  return (
    <Form form={form} onSubmit={onSubmit}>
      <FileField name="logo" label="Logo" required accept={['image/*']} maxBytes={1024 * 1024} />
      <button type="submit">Save</button>
    </Form>
  );
}

const fileInput = (container: HTMLElement) => container.querySelector('input[type="file"]') as HTMLInputElement;

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => 'blob:preview');
  URL.revokeObjectURL = vi.fn();
});

describe('FileField', () => {
  it('is a keyboard-reachable button labelled by the field label', async () => {
    const user = userEvent.setup();
    render(<SingleForm />);
    await user.tab();
    expect(screen.getByRole('button', { name: /Logo/ })).toHaveFocus();
  });

  it('rejects a wrong type or an oversized file with a per-file message', async () => {
    const user = userEvent.setup({ applyAccept: false });
    const { container } = render(<SingleForm />);
    await user.upload(fileInput(container), makeFile('logo.exe', 'application/x-msdownload'));
    expect(await screen.findByText('logo.exe: This file type is not allowed.')).toBeInTheDocument();
    await user.upload(fileInput(container), makeFile('huge.png', 'image/png', 2 * 1024 * 1024));
    expect(await screen.findByText('huge.png: File is too large. The limit is 1 MB.')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Chosen files' })).not.toBeInTheDocument();
  });

  it('shows a chosen image with preview, size and a remove button', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const { container } = render(<SingleForm onSubmit={onSubmit} />);
    const logo = makeFile('logo.png', 'image/png', 1536);
    await user.upload(fileInput(container), logo);
    const list = screen.getByRole('list', { name: 'Chosen files' });
    expect(within(list).getByText('logo.png')).toBeInTheDocument();
    expect(within(list).getByText('1.5 KB')).toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute('src', 'blob:preview');

    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalledWith({ logo });

    await user.click(screen.getByRole('button', { name: 'Remove logo.png' }));
    expect(screen.queryByText('logo.png')).not.toBeInTheDocument();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');
  });

  it('accepts dropped files and limits the count when multiple', async () => {
    render(<MultiForm />);
    const zone = screen.getByRole('button', { name: /Documents/ });
    fireEvent.dragOver(zone, { dataTransfer: { files: [] } });
    expect(zone.className).toContain('bg-primary-50');
    fireEvent.drop(zone, {
      dataTransfer: { files: [makeFile('a.pdf', 'application/pdf'), makeFile('b.png', 'image/png'), makeFile('c.pdf', 'application/pdf')] },
    });
    expect(screen.getByText('a.pdf')).toBeInTheDocument();
    expect(screen.getByText('b.png')).toBeInTheDocument();
    expect(screen.getByText('c.pdf: You can add up to 2 files.')).toBeInTheDocument();
  });

  it('shows the required error on submit and focuses the zone', async () => {
    const user = userEvent.setup();
    render(<MultiForm />);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Add documents')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Documents/ })).toHaveFocus();
  });
});

import { api, getErrorMessage } from '@/lib/api';
import { Dialog } from '@/components/ui';
import { Form, FormActions, FormGrid, NumberField, TextField, useAppForm } from '@/components/forms';
import { useToast } from '@/hooks/useToast';
import { brandSchema, type BrandFormValues } from '@/validations/catalog';

export interface BrandItem {
  id: string;
  name: string;
  code?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

interface BrandFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  brand?: BrandItem | null;
}

export function BrandFormModal({ isOpen, onClose, onSaved, brand }: BrandFormModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={brand ? 'Edit brand' : 'Add brand'}
      description="Manage product brands and manufacturers for your retail store catalog."
    >
      <BrandForm brand={brand} onClose={onClose} onSaved={onSaved} />
    </Dialog>
  );
}

function BrandForm({
  brand,
  onClose,
  onSaved,
}: {
  brand?: BrandItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const isEdit = !!brand?.id;

  const form = useAppForm(brandSchema, {
    defaultValues: {
      name: brand?.name ?? '',
      code: brand?.code ?? '',
      description: brand?.description ?? '',
      displayOrder: brand?.displayOrder ?? 1,
    },
  });

  const handleSubmit = async (values: BrandFormValues) => {
    try {
      if (isEdit && brand?.id) {
        await api.patch(`/catalog/brands/${brand.id}`, values);
        toast.success('Brand updated', `"${values.name}" updated successfully.`);
      } else {
        await api.post('/catalog/brands', values);
        toast.success('Brand created', `"${values.name}" created successfully.`);
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error('Failed to save brand', getErrorMessage(err, 'Could not save brand.'));
    }
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <TextField name="name" label="Brand name" required placeholder="e.g. Tata Consumer" autoComplete="off" />
      <FormGrid>
        <TextField name="code" label="Brand code" optional placeholder="e.g. TATA" autoComplete="off" />
        <NumberField name="displayOrder" label="Sort order" required min={0} tooltip="Lower numbers appear first" />
      </FormGrid>
      <TextField name="description" label="Description" optional placeholder="e.g. Packaged foods, tea and spices" autoComplete="off" />
      <FormActions submitLabel={isEdit ? 'Update brand' : 'Save brand'} submittingLabel="Saving…" onCancel={onClose} />
    </Form>
  );
}


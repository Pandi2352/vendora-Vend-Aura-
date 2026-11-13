import { api, getErrorMessage } from '@/lib/api';
import { Dialog } from '@/components/ui';
import { Form, FormActions, FormGrid, NumberField, TextField, useAppForm } from '@/components/forms';
import { useToast } from '@/hooks/useToast';
import { categorySchema, type CategoryFormValues } from '@/validations/catalog';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  displayOrder?: number;
  isActive?: boolean;
}

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  category?: CategoryItem | null;
}

export function CategoryFormModal({ isOpen, onClose, onSaved, category }: CategoryFormModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={category ? 'Edit category' : 'Add category'}
      description="Organize your store products into customer-facing departments and categories."
    >
      <CategoryForm category={category} onClose={onClose} onSaved={onSaved} />
    </Dialog>
  );
}

function CategoryForm({
  category,
  onClose,
  onSaved,
}: {
  category?: CategoryItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const isEdit = !!category?.id;

  const form = useAppForm(categorySchema, {
    defaultValues: {
      name: category?.name ?? '',
      slug: category?.slug ?? '',
      displayOrder: category?.displayOrder ?? 1,
    },
  });

  const handleSubmit = async (values: CategoryFormValues) => {
    try {
      if (isEdit && category?.id) {
        await api.patch(`/catalog/categories/${category.id}`, values);
        toast.success('Category updated', `"${values.name}" updated successfully.`);
      } else {
        await api.post('/catalog/categories', values);
        toast.success('Category created', `"${values.name}" created successfully.`);
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error('Failed to save category', getErrorMessage(err, 'Could not save category.'));
    }
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <TextField name="name" label="Category name" required placeholder="e.g. Dairy & Eggs" autoComplete="off" />
      <FormGrid>
        <TextField name="slug" label="URL slug" optional placeholder="e.g. dairy-eggs" autoComplete="off" />
        <NumberField name="displayOrder" label="Sort order" required min={0} tooltip="Lower numbers appear first" />
      </FormGrid>
      <FormActions submitLabel={isEdit ? 'Update category' : 'Save category'} submittingLabel="Saving…" onCancel={onClose} />
    </Form>
  );
}


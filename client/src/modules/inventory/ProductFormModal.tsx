import { api, getErrorMessage } from '@/lib/api';
import { Dialog } from '@/components/ui';
import {
  AmountField,
  Form,
  FormActions,
  FormGrid,
  NumberField,
  TextField,
  useAppForm,
} from '@/components/forms';
import { useToast } from '@/hooks/useToast';
import { productSchema, type ProductFormValues } from '@/validations/catalog';
import type { ProductItem } from '@/types/pos.types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  product?: ProductItem | null;
}

export function ProductFormModal({ isOpen, onClose, onSaved, product }: ProductFormModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={product ? 'Edit product' : 'Add product to catalog'}
      description="Products are immediately searchable at checkout and available for inventory tracking."
    >
      <ProductForm product={product} onClose={onClose} onSaved={onSaved} />
    </Dialog>
  );
}

function ProductForm({
  product,
  onClose,
  onSaved,
}: {
  product?: ProductItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const isEdit = !!product?.id;

  const form = useAppForm(productSchema, {
    defaultValues: {
      name: product?.name ?? '',
      category: product?.category ?? '',
      barcode: product?.barcode ?? '',
      unitPrice: product?.unitPrice ?? 0,
      mrp: product?.mrp ?? 0,
      costPrice: product?.costPrice ?? 0,
      taxRatePercent: product?.taxRatePercent ?? 0,
      stock: product?.stock ?? 10,
      unit: 'pcs',
    },
  });

  const handleSubmit = async (values: ProductFormValues) => {
    try {
      if (isEdit && product?.id) {
        await api.patch(`/catalog/products/${product.id}`, values);
        toast.success('Product updated', `"${values.name}" has been updated.`);
      } else {
        await api.post('/catalog/products', values);
        toast.success('Product created', `"${values.name}" added to catalog.`);
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error('Failed to save product', getErrorMessage(err, 'Could not save product details.'));
    }
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <TextField name="name" label="Product name" required placeholder="e.g. Parle-G Gold Biscuits 250g" autoComplete="off" />
      <FormGrid>
        <TextField name="category" label="Category" required placeholder="e.g. Grocery / Biscuits" autoComplete="off" />
        <TextField name="barcode" label="Barcode / SKU" required placeholder="e.g. 8901030001010" autoComplete="off" />
      </FormGrid>
      <FormGrid>
        <AmountField name="unitPrice" label="Selling price (₹)" required tooltip="POS retail selling price" />
        <AmountField name="mrp" label="MRP (₹)" required tooltip="Maximum retail price printed on the pack" />
      </FormGrid>
      <FormGrid>
        <AmountField name="costPrice" label="Cost price (₹)" required tooltip="Purchase cost before tax" />
        <NumberField name="taxRatePercent" label="GST Rate (%)" required min={0} max={100} tooltip="GST percentage (0, 5, 12, 18, 28)" />
      </FormGrid>
      <FormGrid>
        <NumberField name="stock" label="Opening stock quantity" required min={0} />
        <TextField name="unit" label="Unit of measure" optional placeholder="e.g. pcs, kg, ltr, box" />
      </FormGrid>
      <FormActions submitLabel={isEdit ? 'Update product' : 'Save product'} submittingLabel="Saving…" onCancel={onClose} />
    </Form>
  );
}


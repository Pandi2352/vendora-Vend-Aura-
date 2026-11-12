import { api } from '@/lib/api';
import { Dialog } from '@/components/ui';
import {
  DropdownField,
  EmailField,
  Form,
  FormActions,
  FormGrid,
  FormSection,
  NumberField,
  PhoneField,
  TextField,
  UppercaseField,
  useAppForm,
} from '@/components/forms';
import { useToast } from '@/hooks/useToast';
import { digitsOnly } from '@/utils';
import { SUPPLIER_CATEGORIES, supplierSchema, toSupplierPayload, type SupplierValues } from '@/validations/supplier';

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSupplierAdded: () => void;
}

const CATEGORY_OPTIONS = SUPPLIER_CATEGORIES.map((c) => ({ value: c, label: c }));

export function AddSupplierModal({ isOpen, onClose, onSupplierAdded }: AddSupplierModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      size="lg"
      title="Register supplier / distributor"
      description="Suppliers are used for inward stock (GRN) and payables."
    >
      {/* Mounted only while open, so every opening starts with a fresh form. */}
      <AddSupplierForm onClose={onClose} onSupplierAdded={onSupplierAdded} />
    </Dialog>
  );
}

function AddSupplierForm({ onClose, onSupplierAdded }: Omit<AddSupplierModalProps, 'isOpen'>) {
  const toast = useToast();
  const form = useAppForm(supplierSchema, {
    defaultValues: {
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      gstin: '',
      category: 'General FMCG',
      creditDays: 30,
      address: { street: '', city: '', pincode: '' },
    },
  });

  const handleSubmit = async (values: SupplierValues) => {
    await api.post('/suppliers', toSupplierPayload(values));
    toast.success('Supplier registered', values.name);
    onSupplierAdded();
    onClose();
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <FormSection title="Supplier details">
        <TextField
          name="name"
          label="Company / firm name"
          required
          placeholder="e.g. Sri Meenakshi Traders"
          autoComplete="off"
        />
        <FormGrid>
          <TextField
            name="contactPerson"
            label="Contact person"
            optional
            placeholder="e.g. Murugan K"
            autoComplete="off"
          />
          <PhoneField name="phone" label="Phone number" required />
          <EmailField name="email" label="Email" optional placeholder="orders@supplier.in" autoComplete="off" />
          <UppercaseField
            name="gstin"
            label="GSTIN"
            optional
            tooltip="15-character GST number, e.g. 33ABCDE1234F1Z5 (state code + PAN + entity + Z + check digit)"
            placeholder="33ABCDE1234F1Z5"
            maxLength={15}
          />
          <DropdownField
            name="category"
            label="Category"
            options={CATEGORY_OPTIONS}
            clearable
            placeholder="Select category"
          />
          <NumberField
            name="creditDays"
            label="Credit days"
            required
            decimals={0}
            suffix="days"
            min={0}
            max={365}
            stepper
            hint="0 to 365"
          />
        </FormGrid>
      </FormSection>
      <FormSection title="Address" description="Optional">
        <TextField name="address.street" label="Street" placeholder="e.g. 15 Anna Salai" autoComplete="off" />
        <FormGrid>
          <TextField name="address.city" label="City" placeholder="e.g. Chennai" autoComplete="off" />
          <TextField
            name="address.pincode"
            label="PIN code"
            inputMode="numeric"
            maxLength={6}
            placeholder="600002"
            normalize={(v) => digitsOnly(v, 6)}
          />
        </FormGrid>
      </FormSection>
      <FormActions submitLabel="Register supplier" submittingLabel="Saving…" onCancel={onClose} />
    </Form>
  );
}

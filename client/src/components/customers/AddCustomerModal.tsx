import { api } from '@/lib/api';
import { Dialog } from '@/components/ui';
import {
  AmountField,
  EmailField,
  Form,
  FormActions,
  FormGrid,
  PhoneField,
  TextareaField,
  TextField,
  UppercaseField,
  useAppForm,
} from '@/components/forms';
import { useToast } from '@/hooks/useToast';
import { customerSchema, type CustomerValues } from '@/validations/customer';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerAdded: () => void;
}

export function AddCustomerModal({ isOpen, onClose, onCustomerAdded }: AddCustomerModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="Add customer profile"
      description="Customers with a credit limit can buy on Khata (Udhar)."
    >
      {/* Mounted only while open, so every opening starts with a fresh form. */}
      <AddCustomerForm onClose={onClose} onCustomerAdded={onCustomerAdded} />
    </Dialog>
  );
}

function AddCustomerForm({ onClose, onCustomerAdded }: Omit<AddCustomerModalProps, 'isOpen'>) {
  const toast = useToast();
  const form = useAppForm(customerSchema, {
    defaultValues: { name: '', phone: '', email: '', gstin: '', creditLimit: 5000, notes: '' },
  });

  const handleSubmit = async (values: CustomerValues) => {
    await api.post('/customers', values);
    toast.success('Customer added', `${values.name} can now be selected at checkout.`);
    onCustomerAdded();
    onClose();
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <TextField name="name" label="Customer full name" required placeholder="e.g. Arun Kumar" autoComplete="off" />
      <PhoneField name="phone" label="Mobile number" required />
      <FormGrid>
        <EmailField name="email" label="Email" optional placeholder="arun@gmail.com" autoComplete="off" />
        <UppercaseField
          name="gstin"
          label="GSTIN"
          optional
          tooltip="15-character GST number, e.g. 33ABCDE1234F1Z5 (state code + PAN + entity + Z + check digit)"
          placeholder="33ABCDE1234F1Z5"
          maxLength={15}
        />
      </FormGrid>
      <AmountField
        name="creditLimit"
        label="Credit limit"
        required
        tooltip="Khata (credit) sales that would take the balance above this limit are blocked."
        hint="Maximum Udhar allowed for this customer"
      />
      <TextareaField
        name="notes"
        label="Notes"
        optional
        autoResize
        rows={2}
        maxLength={500}
        placeholder="e.g. Regular neighbourhood customer"
      />
      <FormActions submitLabel="Save customer" submittingLabel="Saving…" onCancel={onClose} />
    </Form>
  );
}

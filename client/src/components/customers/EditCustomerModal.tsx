import { useEffect } from 'react';
import { api, getErrorMessage } from '@/lib/api';
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
import type { CustomerItem } from '@/types/pos.types';

interface EditCustomerModalProps {
  customer: CustomerItem | null;
  isOpen: boolean;
  onClose: () => void;
  onCustomerUpdated: () => void;
}

export function EditCustomerModal({ customer, isOpen, onClose, onCustomerUpdated }: EditCustomerModalProps) {
  if (!customer) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={`Edit Customer — ${customer.name}`}
      description="Update contact info, GSTIN, and credit limits for Khata ledger accounts."
    >
      <EditCustomerForm customer={customer} onClose={onClose} onCustomerUpdated={onCustomerUpdated} />
    </Dialog>
  );
}

function EditCustomerForm({
  customer,
  onClose,
  onCustomerUpdated,
}: {
  customer: CustomerItem;
  onClose: () => void;
  onCustomerUpdated: () => void;
}) {
  const toast = useToast();
  const form = useAppForm(customerSchema, {
    defaultValues: {
      name: customer.name,
      phone: customer.phone,
      email: customer.email ?? '',
      gstin: customer.gstin ?? '',
      creditLimit: customer.creditLimit,
      notes: customer.notes ?? '',
    },
  });

  useEffect(() => {
    form.reset({
      name: customer.name,
      phone: customer.phone,
      email: customer.email ?? '',
      gstin: customer.gstin ?? '',
      creditLimit: customer.creditLimit,
      notes: customer.notes ?? '',
    });
  }, [customer, form]);

  const handleSubmit = async (values: CustomerValues) => {
    try {
      await api.put(`/customers/${customer.id}`, values);
      toast.success('Customer updated', `${values.name}'s profile has been updated.`);
      onCustomerUpdated();
      onClose();
    } catch (err) {
      toast.error('Update failed', getErrorMessage(err, 'Could not update customer details.'));
    }
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
          tooltip="15-character GST number (e.g. 33ABCDE1234F1Z5)"
          placeholder="33ABCDE1234F1Z5"
          maxLength={15}
        />
      </FormGrid>
      <AmountField
        name="creditLimit"
        label="Credit limit"
        required
        tooltip="Khata (credit) sales above this balance will be blocked."
      />
      <TextareaField
        name="notes"
        label="Notes"
        optional
        autoResize
        rows={2}
        maxLength={500}
        placeholder="Customer preferences or notes"
      />
      <FormActions submitLabel="Update customer" submittingLabel="Updating…" onCancel={onClose} />
    </Form>
  );
}


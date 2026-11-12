import { useMemo } from 'react';
import { api } from '@/lib/api';
import { Dialog } from '@/components/ui';
import { DropdownField, Form, FormActions, FormGrid, TextareaField, TextField, useAppForm } from '@/components/forms';
import { useToast } from '@/hooks/useToast';
import { formatInr } from '@/utils';
import { EMPTY_INWARD_LINE, inwardSchema, type InwardValues } from '@/validations/supplier';
import type { ProductItem, SupplierItem } from '@/types/pos.types';
import { InwardItemsTable } from './InwardItemsTable';
import { InwardPaymentSection } from './InwardPaymentSection';
import { buildInwardPayload } from './inward-payload';

interface InwardStockModalProps {
  isOpen: boolean;
  suppliers: SupplierItem[];
  products: ProductItem[];
  onClose: () => void;
  onInwardSuccess: () => void;
}

export function InwardStockModal({ isOpen, suppliers, products, onClose, onInwardSuccess }: InwardStockModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      size="xl"
      title="Inward stock delivery (Goods Receipt Note)"
      description="Increments active stock and updates the cost ledger."
    >
      {/* Mounted only while open, so every opening starts with a fresh form. */}
      <InwardStockForm suppliers={suppliers} products={products} onClose={onClose} onInwardSuccess={onInwardSuccess} />
    </Dialog>
  );
}

function InwardStockForm({ suppliers, products, onClose, onInwardSuccess }: Omit<InwardStockModalProps, 'isOpen'>) {
  const toast = useToast();
  const form = useAppForm(inwardSchema, {
    defaultValues: {
      supplierId: null as unknown as string,
      supplierInvoiceNumber: '',
      items: [EMPTY_INWARD_LINE],
      paymentStatus: 'UNPAID',
      amountPaid: undefined,
      notes: '',
    },
  });

  const supplierOptions = useMemo(
    () => suppliers.map((s) => ({ value: s.id, label: s.name, description: s.phone })),
    [suppliers],
  );

  const handleSubmit = async (values: InwardValues) => {
    const payload = buildInwardPayload(values, products);
    await api.post('/suppliers/inward', payload);
    toast.success('Stock inwarded', `${payload.items.length} product line(s), ${formatInr(payload.grandTotal)}.`);
    onInwardSuccess();
    onClose();
  };

  return (
    <Form form={form} onSubmit={handleSubmit} className="space-y-4">
      <FormGrid>
        <DropdownField
          name="supplierId"
          label="Supplier"
          required
          searchable
          options={supplierOptions}
          placeholder="Choose supplier"
          emptyMessage="No suppliers yet. Register one first."
        />
        <TextField
          name="supplierInvoiceNumber"
          label="Vendor invoice #"
          optional
          placeholder="e.g. INV/2026/894"
          autoComplete="off"
        />
      </FormGrid>
      <InwardItemsTable products={products} />
      <InwardPaymentSection />
      <TextareaField
        name="notes"
        label="Notes"
        optional
        autoResize
        rows={2}
        maxLength={500}
        placeholder="e.g. Delivery received in good condition"
      />
      <FormActions submitLabel="Confirm inward & add stock" submittingLabel="Finalizing GRN…" onCancel={onClose} />
    </Form>
  );
}

import { api, getErrorMessage } from '@/lib/api';
import { Dialog, Dropdown } from '@/components/ui';
import {
  AmountField,
  Form,
  FormActions,
  FormGrid,
  NumberField,
  TextField,
  UppercaseField,
  useAppForm,
} from '@/components/forms';
import { useToast } from '@/hooks/useToast';
import { discountSchema, type DiscountFormValues } from '@/validations/discount';

export type DiscountType = 'PERCENTAGE' | 'FLAT' | 'BUY_X_GET_Y' | 'HAPPY_HOUR';

export interface DiscountItem {
  id: string;
  code: string;
  name: string;
  type: DiscountType;
  value: number;
  minOrderValue?: number;
  maxDiscountCap?: number;
  happyHourStart?: string;
  happyHourEnd?: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
}

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  discount?: DiscountItem | null;
}

const TYPE_OPTIONS = [
  { value: 'PERCENTAGE', label: 'Percentage (%) Off' },
  { value: 'FLAT', label: 'Flat Cash (₹) Off' },
  { value: 'HAPPY_HOUR', label: 'Happy Hour Time Window (%)' },
];

export function DiscountModal({ isOpen, onClose, onSaved, discount }: DiscountModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={discount ? `Edit Offer — ${discount.code}` : 'Create Merchandising Offer / Promo'}
      description="Define coupon codes, seasonal discounts, or happy hour windows redeemable at POS checkout."
    >
      <DiscountForm discount={discount} onClose={onClose} onSaved={onSaved} />
    </Dialog>
  );
}

function DiscountForm({
  discount,
  onClose,
  onSaved,
}: {
  discount?: DiscountItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const isEdit = !!discount?.id;

  const form = useAppForm(discountSchema, {
    defaultValues: {
      code: discount?.code ?? '',
      name: discount?.name ?? '',
      type: discount?.type ?? 'PERCENTAGE',
      value: discount?.value ?? 10,
      minOrderValue: discount?.minOrderValue ?? 0,
      maxDiscountCap: discount?.maxDiscountCap ?? 100,
      happyHourStart: discount?.happyHourStart ?? '14:00',
      happyHourEnd: discount?.happyHourEnd ?? '17:00',
      usageLimit: discount?.usageLimit ?? 500,
    },
  });

  const selectedType = form.watch('type');

  const handleSubmit = async (values: DiscountFormValues) => {
    try {
      if (isEdit && discount?.id) {
        await api.patch(`/discounts/${discount.id}`, values);
        toast.success('Offer updated', `Promo code "${values.code}" updated.`);
      } else {
        await api.post('/discounts', values);
        toast.success('Offer created', `Promo code "${values.code}" is now active.`);
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error('Failed to save offer', getErrorMessage(err, 'Could not save discount offer.'));
    }
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <FormGrid>
        <UppercaseField name="code" label="Promo Coupon Code" required placeholder="e.g. DIWALI20" />
        <TextField name="name" label="Offer Title" required placeholder="e.g. Festive 20% Off" />
      </FormGrid>
      <div>
        <span className="block text-xs font-bold text-zinc-700 mb-1">Offer Type</span>
        <Dropdown
          options={TYPE_OPTIONS}
          value={selectedType}
          onChange={(v) => form.setValue('type', (v as DiscountType) ?? 'PERCENTAGE')}
        />
      </div>
      <FormGrid>
        <AmountField
          name="value"
          label={selectedType === 'FLAT' ? 'Flat Discount Amount (₹)' : 'Discount Rate (%)'}
          required
        />
        <AmountField name="minOrderValue" label="Minimum Cart Value (₹)" required tooltip="Minimum bill subtotal required" />
      </FormGrid>
      {selectedType !== 'FLAT' && (
        <AmountField
          name="maxDiscountCap"
          label="Maximum Discount Cap (₹)"
          required
          tooltip="Caps the maximum rupee discount for percentage offers"
        />
      )}
      {selectedType === 'HAPPY_HOUR' && (
        <FormGrid>
          <TextField name="happyHourStart" label="Start Time (HH:mm)" placeholder="14:00" />
          <TextField name="happyHourEnd" label="End Time (HH:mm)" placeholder="17:00" />
        </FormGrid>
      )}
      <NumberField name="usageLimit" label="Total Redemptions Limit" required min={1} />
      <FormActions submitLabel={isEdit ? 'Update offer' : 'Create offer'} submittingLabel="Saving…" onCancel={onClose} />
    </Form>
  );
}

import { CheckboxField, DropdownField, FormGrid, FormSection, NumberField, TextField, UppercaseField } from '@/components/forms';
import { FieldIcon } from '../../shared/FieldIcon';
import { VOUCHER_TYPES } from './voucher.schema';

export function VoucherFields() {
  return (
    <>
      <FormSection title="Voucher Series Identity">
        <FormGrid columns={3}>
          <UppercaseField
            name="code"
            label="Series Code / Prefix"
            required
            placeholder="e.g. GV-FESTIVE500"
            maxLength={20}
            autoFocus
            leftAddon={<FieldIcon name="confirmation_number" />}
          />
          <TextField
            name="name"
            label="Campaign / Voucher Name"
            required
            placeholder="e.g. Festive Season Gift Voucher Rs. 500"
            maxLength={80}
            className="lg:col-span-2"
            leftAddon={<FieldIcon name="card_giftcard" />}
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Value & Redemption Terms">
        <FormGrid columns={2}>
          <DropdownField
            name="voucherType"
            label="Benefit Type"
            required
            options={VOUCHER_TYPES.map((v) => ({ value: v.value, label: v.label }))}
          />
          <NumberField
            name="value"
            label="Benefit Value (₹ or %)"
            required
            min={1}
            placeholder="500"
          />
          <NumberField
            name="minBillAmount"
            label="Minimum Bill Spend (₹)"
            min={0}
            placeholder="2000"
          />
          <NumberField
            name="validityDays"
            label="Validity Period (Days)"
            min={1}
            placeholder="90"
          />
        </FormGrid>
      </FormSection>

      <CheckboxField name="active" label="Active voucher available for issuing and redemption" />
    </>
  );
}

import { DropdownField, FormGrid, FormSection, TextField, UppercaseField } from '@/components/forms';
import { FieldIcon } from '../../shared/FieldIcon';
import { EFFECTS, TRANSACTION_TYPES } from './reason.schema';

export function ReasonFields() {
  return (
    <FormSection title="Reason">
      <FormGrid columns={3}>
        <UppercaseField
          name="code"
          label="Reason code"
          required
          placeholder="e.g. DAMAGE"
          maxLength={15}
          autoFocus
          leftAddon={<FieldIcon name="tag" />}
        />
        <TextField
          name="description"
          label="Reason description"
          required
          placeholder="e.g. Damaged stock"
          maxLength={120}
          className="lg:col-span-2"
          leftAddon={<FieldIcon name="description" />}
        />
        <TextField
          name="reasonFor"
          label="Reason for"
          placeholder="Optional note, e.g. Glass items"
          maxLength={60}
          leftAddon={<FieldIcon name="label" />}
        />
        <DropdownField
          name="transactionType"
          label="Transaction type"
          required
          options={[...TRANSACTION_TYPES]}
          placeholder="Select"
          leftIcon={<FieldIcon name="swap_horiz" />}
        />
        <DropdownField
          name="effect"
          label="Addition / deduction"
          required
          options={[...EFFECTS]}
          placeholder="Select"
          leftIcon={<FieldIcon name="calculate" />}
        />
      </FormGrid>
    </FormSection>
  );
}

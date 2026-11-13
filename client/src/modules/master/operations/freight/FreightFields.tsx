import { CheckboxField, DropdownField, FormGrid, FormSection, NumberField, TextField, UppercaseField } from '@/components/forms';
import { FieldIcon } from '../../shared/FieldIcon';
import { APPLICABLE_OPTIONS, RATE_TYPES } from './freight.schema';

export function FreightFields() {
  return (
    <>
      <FormSection title="Rule Identity">
        <FormGrid columns={3}>
          <UppercaseField
            name="code"
            label="Freight Code"
            required
            placeholder="e.g. FRT-LOCAL"
            maxLength={15}
            autoFocus
            leftAddon={<FieldIcon name="tag" />}
          />
          <TextField
            name="name"
            label="Freight Rule Name"
            required
            placeholder="e.g. Standard Local City Delivery"
            maxLength={80}
            className="lg:col-span-2"
            leftAddon={<FieldIcon name="receipt_long" />}
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Rate Calculation & Slabs">
        <FormGrid columns={2}>
          <DropdownField
            name="rateType"
            label="Calculation Method"
            required
            options={RATE_TYPES.map((t) => ({ value: t.value, label: t.label }))}
          />
          <DropdownField
            name="applicableOn"
            label="Applicable On"
            required
            options={APPLICABLE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
          <NumberField
            name="rate"
            label="Rate / Charge Amount"
            required
            min={0}
            step={0.5}
            placeholder="e.g. 60"
          />
          <NumberField
            name="minAmount"
            label="Minimum Base Charge"
            min={0}
            step={1}
            placeholder="e.g. 40"
          />
        </FormGrid>
      </FormSection>

      <CheckboxField name="active" label="Active freight rule ready for billing calculation" />
    </>
  );
}


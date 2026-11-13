import { CheckboxField, FormGrid, FormSection, PhoneField, TextField, UppercaseField } from '@/components/forms';
import { FieldIcon } from '../../shared/FieldIcon';

export function PickerFields() {
  return (
    <>
      <FormSection title="Picker Profile">
        <FormGrid columns={3}>
          <UppercaseField
            name="code"
            label="Badge / Employee Code"
            required
            placeholder="e.g. PKR-01"
            maxLength={15}
            autoFocus
            leftAddon={<FieldIcon name="badge" />}
          />
          <TextField
            name="name"
            label="Picker Full Name"
            required
            placeholder="e.g. Karthik Sundaram"
            maxLength={80}
            className="lg:col-span-2"
            leftAddon={<FieldIcon name="group" />}
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Contact & Floor Assignment">
        <FormGrid columns={2}>
          <PhoneField
            name="phone"
            label="Contact Mobile"
            placeholder="+91 98401 54321"
          />
          <TextField
            name="assignedZone"
            label="Assigned Store Aisle / Warehouse Zone"
            placeholder="e.g. Grocery & Staples (Aisle 1-4)"
            maxLength={80}
            leftAddon={<FieldIcon name="location_on" />}
          />
        </FormGrid>
      </FormSection>

      <CheckboxField name="active" label="Active picker available for order fulfillment tasks" />
    </>
  );
}


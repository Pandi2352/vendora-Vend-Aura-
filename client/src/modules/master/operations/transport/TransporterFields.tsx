import { CheckboxField, FormGrid, FormSection, PhoneField, TextField, UppercaseField } from '@/components/forms';
import { FieldIcon } from '../../shared/FieldIcon';

export function TransporterFields() {
  return (
    <>
      <FormSection title="Identity">
        <FormGrid columns={3}>
          <UppercaseField
            name="code"
            label="Transporter Code"
            required
            placeholder="e.g. TR-BLUEDART"
            maxLength={15}
            autoFocus
            leftAddon={<FieldIcon name="tag" />}
          />
          <TextField
            name="name"
            label="Transporter Name"
            required
            placeholder="e.g. Blue Dart Express"
            maxLength={60}
            className="lg:col-span-2"
            leftAddon={<FieldIcon name="local_shipping" />}
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Logistics & Contact">
        <FormGrid columns={2}>
          <UppercaseField
            name="transporterId"
            label="GST Transporter ID / E-way bill ID"
            placeholder="e.g. 29AABCU9603R1ZM"
            maxLength={30}
            leftAddon={<FieldIcon name="badge" />}
          />
          <PhoneField
            name="phone"
            label="Contact Phone"
            placeholder="+91 98401 23456"
          />
          <TextField
            name="address"
            label="Depot / Office Address"
            placeholder="Depot location, City"
            maxLength={120}
            className="lg:col-span-2"
            leftAddon={<FieldIcon name="location_on" />}
          />
        </FormGrid>
      </FormSection>

      <CheckboxField name="active" label="Active transporter available for dispatch" />
    </>
  );
}

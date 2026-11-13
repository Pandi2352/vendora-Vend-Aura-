import {
  DropdownField,
  FormGrid,
  FormSection,
  PercentField,
  PhoneField,
  TextField,
  UppercaseField,
} from '@/components/forms';
import { digitsOnly } from '@/utils/string';
import { FieldIcon } from '../../shared/FieldIcon';

const BASIS_OPTIONS = [
  { value: 'net-cost', label: 'Net cost' },
  { value: 'landing-cost', label: 'Landing cost' },
  { value: 'mrp', label: 'MRP' },
];
const TYPE_OPTIONS = [
  { value: 'add', label: 'Add to cost' },
  { value: 'deduct', label: 'Deduct from cost' },
];

export function WarehouseFields() {
  return (
    <>
      <FormSection title="Identity">
        <FormGrid columns={3}>
          <UppercaseField
            name="code"
            label="Code"
            required
            placeholder="e.g. WH01"
            maxLength={10}
            autoFocus
            leftAddon={<FieldIcon name="tag" />}
          />
          <TextField
            name="name"
            label="Name"
            required
            placeholder="Warehouse name"
            maxLength={80}
            className="lg:col-span-2"
            leftAddon={<FieldIcon name="warehouse" />}
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Address">
        <FormGrid columns={4}>
          <TextField
            name="address1"
            label="Address 1"
            placeholder="Door no., street"
            leftAddon={<FieldIcon name="location_on" />}
          />
          <TextField
            name="address2"
            label="Address 2"
            placeholder="Area"
            leftAddon={<FieldIcon name="location_on" />}
          />
          <TextField
            name="address3"
            label="Address 3"
            placeholder="Landmark"
            leftAddon={<FieldIcon name="location_on" />}
          />
          <TextField
            name="pincode"
            label="PIN code"
            placeholder="6 digits"
            inputMode="numeric"
            maxLength={6}
            normalize={digitsOnly}
            leftAddon={<FieldIcon name="markunread_mailbox" />}
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Contact">
        <FormGrid columns={4}>
          <PhoneField name="phone" label="Phone" />
          <TextField
            name="fax"
            label="Fax"
            inputMode="tel"
            maxLength={15}
            normalize={digitsOnly}
            leftAddon={<FieldIcon name="fax" />}
          />
        </FormGrid>
      </FormSection>

      <FormSection
        title="Transfer-out handling charge"
        description="Added to (or taken off) the cost when stock is transferred out of this warehouse."
      >
        <FormGrid columns={4}>
          <PercentField name="handlingPercent" label="Charge %" required leftAddon={<FieldIcon name="percent" />} />
          <DropdownField
            name="handlingBasis"
            label="Charged on"
            options={BASIS_OPTIONS}
            placeholder="Select"
            clearable
            leftIcon={<FieldIcon name="calculate" />}
          />
          <DropdownField
            name="handlingType"
            label="Type"
            options={TYPE_OPTIONS}
            placeholder="Select"
            clearable
            leftIcon={<FieldIcon name="swap_vert" />}
          />
        </FormGrid>
      </FormSection>
    </>
  );
}

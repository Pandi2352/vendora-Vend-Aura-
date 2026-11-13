import { useFormContext, useWatch } from 'react-hook-form';
import {
  DropdownField,
  FormGrid,
  FormSection,
  PhoneField,
  SwitchField,
  TextField,
  UppercaseField,
} from '@/components/forms';
import type { DropdownOption } from '@/components/ui/dropdown/dropdown-utils';
import { digitsOnly } from '@/utils/string';
import { STATE_OPTIONS } from '../company/config/options';
import { FieldIcon } from '../../shared/FieldIcon';
import type { LocationInput } from './location.schema';

/** Location form; `warehouses` are the active warehouses it can draw stock from. */
export function LocationFields({ warehouses }: { warehouses: DropdownOption[] }) {
  const { setValue } = useFormContext<LocationInput>();
  const isWarehouse = useWatch<LocationInput, 'isWarehouse'>({ name: 'isWarehouse' });

  return (
    <>
      <FormSection title="Identity">
        <FormGrid columns={4}>
          <UppercaseField
            name="code"
            label="Location code"
            required
            placeholder="e.g. BR01"
            maxLength={10}
            autoFocus
            leftAddon={<FieldIcon name="tag" />}
          />
          <TextField
            name="name"
            label="Location name"
            required
            placeholder="Branch or outlet name"
            maxLength={80}
            leftAddon={<FieldIcon name="storefront" />}
          />
          <TextField
            name="incharge"
            label="Incharge"
            placeholder="Person in charge"
            maxLength={80}
            leftAddon={<FieldIcon name="person" />}
          />
          <UppercaseField
            name="sortCode"
            label="Sort code"
            placeholder="2 chars"
            maxLength={2}
            leftAddon={<FieldIcon name="sort" />}
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Address">
        <FormGrid columns={3}>
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
            name="city"
            label="City"
            placeholder="e.g. Sivakasi"
            leftAddon={<FieldIcon name="location_city" />}
          />
          <DropdownField
            name="state"
            label="State"
            options={STATE_OPTIONS}
            searchable
            clearable
            placeholder="Select state"
            leftIcon={<FieldIcon name="map" />}
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

      <FormSection title="GST">
        <FormGrid columns={4}>
          <UppercaseField
            name="gstin"
            label="GSTIN"
            placeholder="15-character GST number"
            maxLength={15}
            inputClassName="font-mono"
            hint="Needed before this location can send or receive an e-way bill"
            className="sm:col-span-2"
            leftAddon={<FieldIcon name="verified" />}
            onValueChange={(gstin) =>
              /^\d{2}/.test(gstin) && setValue('stateCode', gstin.slice(0, 2), { shouldDirty: true })
            }
          />
          <TextField
            name="stateCode"
            label="State code"
            placeholder="e.g. 33"
            inputMode="numeric"
            maxLength={2}
            normalize={digitsOnly}
            hint="Filled from the GSTIN's first two digits"
            leftAddon={<FieldIcon name="pin" />}
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Contact & warehouse">
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
          <SwitchField
            name="isWarehouse"
            label="Is a warehouse"
            checkboxDescription="This location stores stock"
            variant="card"
            className="self-end"
          />
          <DropdownField
            name="warehouseId"
            label="Draws stock from"
            options={warehouses}
            placeholder={warehouses.length ? 'Select warehouse' : 'No warehouses yet'}
            clearable
            disabled={!!isWarehouse || warehouses.length === 0}
            leftIcon={<FieldIcon name="warehouse" />}
          />
        </FormGrid>
      </FormSection>
    </>
  );
}

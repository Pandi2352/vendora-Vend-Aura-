import { DropdownField, FormGrid, TextField, UppercaseField } from '@/components/forms';
import { digitsOnly } from '@/utils/string';
import { FieldIcon } from '../../../shared/FieldIcon';
import { COUNTRY_OPTIONS, STATE_OPTIONS } from '../config/options';

/** 4 columns on wide screens: codes + name / both address lines / place / remarks. */
export function IdentitySection() {
  return (
    <FormGrid columns={4}>
      <UppercaseField
        name="companyCode"
        label="Company code"
        required
        placeholder="e.g. CMP-01"
        maxLength={20}
        leftAddon={<FieldIcon name="tag" />}
      />
      <UppercaseField
        name="locationCode"
        label="Location code"
        placeholder="e.g. HQ"
        maxLength={20}
        leftAddon={<FieldIcon name="store" />}
      />
      <TextField
        name="companyName"
        label="Company name"
        required
        placeholder="Registered business name"
        maxLength={120}
        className="sm:col-span-2"
        leftAddon={<FieldIcon name="business" />}
      />

      <TextField
        name="addressLine1"
        label="Address line 1"
        required
        placeholder="Door no., street, building"
        autoComplete="address-line1"
        className="sm:col-span-2"
        leftAddon={<FieldIcon name="location_on" />}
      />
      <TextField
        name="addressLine2"
        label="Address line 2"
        placeholder="Area, landmark, floor"
        autoComplete="address-line2"
        className="sm:col-span-2"
        leftAddon={<FieldIcon name="signpost" />}
      />

      <DropdownField
        name="country"
        label="Country"
        required
        options={COUNTRY_OPTIONS}
        leftIcon={<FieldIcon name="public" />}
      />
      <DropdownField
        name="state"
        label="State"
        required
        searchable
        options={STATE_OPTIONS}
        placeholder="Select state"
        leftIcon={<FieldIcon name="flag" />}
      />
      <TextField
        name="city"
        label="City"
        placeholder="e.g. Sivakasi"
        autoComplete="address-level2"
        leftAddon={<FieldIcon name="location_city" />}
      />
      <TextField
        name="postalCode"
        label="PIN code"
        placeholder="6-digit PIN"
        inputMode="numeric"
        maxLength={6}
        normalize={digitsOnly}
        autoComplete="postal-code"
        leftAddon={<FieldIcon name="markunread_mailbox" />}
      />

      <TextField
        name="remarks"
        label="Remarks"
        placeholder="Internal note, not printed"
        maxLength={300}
        className="sm:col-span-2 xl:col-span-4"
        leftAddon={<FieldIcon name="notes" />}
      />
    </FormGrid>
  );
}

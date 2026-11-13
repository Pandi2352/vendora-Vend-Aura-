import {
  DropdownField,
  EmailField,
  FormGrid,
  PercentField,
  PhoneField,
  SwitchField,
  TextField,
  UppercaseField,
} from '@/components/forms';
import { digitsOnly } from '@/utils/string';
import { FieldIcon } from '../../../shared/FieldIcon';
import { TAX_TAKEN_OPTIONS } from '../config/options';

export function ContactTaxSection() {
  return (
    <FormGrid columns={4}>
      <PhoneField name="phone" label="Phone" />
      <TextField
        name="fax"
        label="Fax"
        placeholder="Fax number"
        inputMode="tel"
        maxLength={20}
        normalize={digitsOnly}
        leftAddon={<FieldIcon name="fax" />}
      />
      <EmailField
        name="email"
        label="E-mail"
        placeholder="accounts@yourshop.com"
        leftAddon={<FieldIcon name="mail" />}
      />

      <TextField
        name="website"
        label="Webpage / URL"
        placeholder="www.example.com"
        inputMode="url"
        spellCheck={false}
        leftAddon={<FieldIcon name="language" />}
      />
      <UppercaseField
        name="gstin"
        label="GSTIN"
        placeholder="15-character GST number"
        maxLength={15}
        inputClassName="font-mono"
        hint="Printed on every tax invoice"
        leftAddon={<FieldIcon name="verified" />}
      />

      <UppercaseField
        name="businessRegNo"
        label="Business reg. no."
        placeholder="CIN / Udyam no."
        maxLength={30}
        leftAddon={<FieldIcon name="badge" />}
      />
      <UppercaseField
        name="drugLicenceNo"
        label="Drug licence no."
        placeholder="Pharmacies only"
        maxLength={30}
        leftAddon={<FieldIcon name="medication" />}
      />
      <TextField
        name="taxType"
        label="Tax type"
        readOnly
        tooltip="Vendora bills under GST only"
        leftAddon={<FieldIcon name="percent" />}
      />

      <PercentField
        name="taxPercent"
        label="Tax %"
        leftAddon={<FieldIcon name="calculate" />}
        hint="Default rate for new items"
      />
      <UppercaseField
        name="tinNo"
        label="TIN / GST reg. no."
        placeholder="State registration no."
        maxLength={30}
        leftAddon={<FieldIcon name="pin" />}
      />
      <DropdownField
        name="taxTaken"
        label="Tax taken"
        options={TAX_TAKEN_OPTIONS}
        placeholder="Select basis"
        clearable
        leftIcon={<FieldIcon name="account_balance_wallet" />}
      />

      <SwitchField
        name="taxInclusive"
        label="Tax inclusive"
        checkboxDescription="Item prices already include tax"
        variant="card"
        className="self-end"
      />
    </FormGrid>
  );
}

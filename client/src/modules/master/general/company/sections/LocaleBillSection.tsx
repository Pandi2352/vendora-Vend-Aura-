import { useFormContext } from 'react-hook-form';
import { DropdownField, FormGrid, TextField } from '@/components/forms';
import type { CompanyProfileInput } from '../config/companyProfile.schema';
import { FieldIcon } from '../components/FieldIcon';
import {
  BILL_PRINT_OPTIONS,
  COM_PORT_OPTIONS,
  CURRENCY_OPTIONS,
  CURRENCY_SIGNS,
  DATE_FORMAT_OPTIONS,
  TIME_FORMAT_OPTIONS,
} from '../config/options';

/** Pole-display lines fill the second row; the longer bill lines share the third. */
const MESSAGE_ROWS = [
  {
    name: 'displayMessage1',
    label: 'Display message 1',
    placeholder: 'Pole display line 1',
    icon: 'cast',
    max: 20,
    wide: false,
  },
  {
    name: 'displayMessage2',
    label: 'Display message 2',
    placeholder: 'Pole display line 2',
    icon: 'cast',
    max: 20,
    wide: false,
  },
  {
    name: 'billMessage1',
    label: 'Bill message 1',
    placeholder: 'e.g. NO EXCHANGE / NO RETURN',
    icon: 'chat',
    max: 48,
    wide: true,
  },
  {
    name: 'billMessage2',
    label: 'Bill message 2',
    placeholder: 'e.g. *** THANK YOU, VISIT AGAIN ***',
    icon: 'chat',
    max: 48,
    wide: true,
  },
] as const;

export function LocaleBillSection() {
  const { setValue } = useFormContext<CompanyProfileInput>();

  return (
    <FormGrid columns={4}>
      <DropdownField
        name="currency"
        label="Default currency"
        required
        options={CURRENCY_OPTIONS}
        leftIcon={<FieldIcon name="payments" />}
        onValueChange={(code) =>
          code && setValue('currencySign', CURRENCY_SIGNS[code] ?? code, { shouldDirty: true, shouldValidate: true })
        }
      />
      <TextField
        name="currencySign"
        label="Currency sign"
        required
        maxLength={5}
        leftAddon={<FieldIcon name="currency_rupee" />}
      />
      <DropdownField
        name="dateFormat"
        label="Date format"
        required
        options={DATE_FORMAT_OPTIONS}
        leftIcon={<FieldIcon name="calendar_month" />}
      />

      <DropdownField
        name="timeFormat"
        label="Time format"
        required
        options={TIME_FORMAT_OPTIONS}
        leftIcon={<FieldIcon name="schedule" />}
      />
      <DropdownField
        name="billPrintFormat"
        label="Bill print format"
        options={BILL_PRINT_OPTIONS}
        placeholder="Select format"
        clearable
        leftIcon={<FieldIcon name="print" />}
      />
      <DropdownField
        name="barcodePort"
        label="Barcode COM port"
        options={COM_PORT_OPTIONS}
        placeholder="e.g. COM3"
        clearable
        leftIcon={<FieldIcon name="usb" />}
      />
      {MESSAGE_ROWS.map((row) => (
        <TextField
          key={row.name}
          name={row.name}
          label={row.label}
          placeholder={row.placeholder}
          maxLength={row.max}
          showCount
          className={row.wide ? 'sm:col-span-2' : undefined}
          leftAddon={<FieldIcon name={row.icon} />}
        />
      ))}
    </FormGrid>
  );
}

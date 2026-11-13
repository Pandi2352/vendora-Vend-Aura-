import { useFormContext, useWatch } from 'react-hook-form';
import { DropdownField, FormGrid, FormSection, RadioGroupField, TextField, UppercaseField } from '@/components/forms';
import { FieldIcon } from '../../shared/FieldIcon';
import { PARAM_MODULES, VALUE_TYPES, type ParamInput } from './param.schema';

const YES_NO = [
  { value: 'YES', label: 'Yes' },
  { value: 'NO', label: 'No' },
];

/** Parameter form: the Value input follows the chosen value type. */
export function ParamFields() {
  const { setValue } = useFormContext<ParamInput>();
  const valueType = useWatch<ParamInput, 'valueType'>({ name: 'valueType' });

  return (
    <FormSection title="Parameter">
      <FormGrid columns={3}>
        <UppercaseField
          name="code"
          label="Parameter key"
          required
          placeholder="e.g. BILL_COPIES"
          maxLength={30}
          autoFocus
          inputClassName="font-mono"
          leftAddon={<FieldIcon name="key" />}
        />
        <TextField
          name="description"
          label="Description"
          required
          placeholder="What this setting controls"
          maxLength={120}
          className="lg:col-span-2"
          leftAddon={<FieldIcon name="description" />}
        />
        <DropdownField
          name="module"
          label="Module"
          required
          options={[...PARAM_MODULES]}
          leftIcon={<FieldIcon name="apps" />}
        />
        <DropdownField
          name="valueType"
          label="Value type"
          required
          options={[...VALUE_TYPES]}
          leftIcon={<FieldIcon name="data_object" />}
          onValueChange={(type) => setValue('value', type === 'yesno' ? 'NO' : '', { shouldDirty: true })}
        />
        {valueType === 'yesno' ? (
          <RadioGroupField name="value" label="Value" required variant="segmented" options={YES_NO} />
        ) : (
          <TextField
            name="value"
            label="Value"
            required
            placeholder={valueType === 'number' ? 'e.g. 2' : 'Value'}
            inputMode={valueType === 'number' ? 'decimal' : undefined}
            maxLength={120}
            leftAddon={<FieldIcon name={valueType === 'number' ? 'pin' : 'text_fields'} />}
          />
        )}
      </FormGrid>
    </FormSection>
  );
}

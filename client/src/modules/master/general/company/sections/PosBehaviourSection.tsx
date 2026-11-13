import {
  DateField,
  FormGrid,
  FormSection,
  PercentField,
  RadioGroupField,
  SwitchField,
  TimeField,
} from '@/components/forms';
import { FieldIcon } from '../../../shared/FieldIcon';
import { CASH_ROUNDING_OPTIONS } from '../config/options';

const SWITCHES = [
  { name: 'roundOff', label: 'Round off', description: 'Round the bill total' },
  { name: 'paymodeDiscount', label: 'Paymode discount', description: 'Discount by payment mode' },
  { name: 'memberModule', label: 'Member module', description: 'Loyalty members at the till' },
  { name: 'allowMultipleDiscount', label: 'Allow multiple discounts', description: 'Stack more than one discount' },
] as const;

export function PosBehaviourSection() {
  return (
    <div className="space-y-4">
      <FormGrid columns={4}>
        <PercentField
          name="maxDiscount"
          label="Max discount %"
          required
          leftAddon={<FieldIcon name="sell" />}
          hint="Highest discount a cashier can give"
        />
        <PercentField
          name="maxPriceChange"
          label="Max price change %"
          required
          leftAddon={<FieldIcon name="price_change" />}
        />
        <PercentField name="maxCost" label="Max cost %" required leftAddon={<FieldIcon name="savings" />} />

        <TimeField
          name="expiredTime"
          label="Expired time"
          placeholder="e.g. 23:59"
          hint="Sessions close after this time"
        />
        <DateField name="eodDate" label="EOD date" placeholder="Select date" hint="Current end-of-day business date" />
        <RadioGroupField
          name="cashRounding"
          label="Cash rounding"
          variant="segmented"
          options={CASH_ROUNDING_OPTIONS}
          hint="Round cash payments to the nearest step"
          className="sm:col-span-1 xl:col-span-3"
        />
      </FormGrid>

      <FormSection title="Modules">
        <FormGrid columns={4}>
          {SWITCHES.map((item) => (
            <SwitchField
              key={item.name}
              name={item.name}
              label={item.label}
              checkboxDescription={item.description}
              variant="card"
            />
          ))}
        </FormGrid>
      </FormSection>
    </div>
  );
}

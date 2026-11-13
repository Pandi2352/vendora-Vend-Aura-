import { CheckboxField, DropdownField, FormGrid, FormSection, TextField, UppercaseField } from '@/components/forms';
import type { DropdownOption } from '@/components/ui/dropdown/dropdown-utils';
import { FieldIcon } from '../../shared/FieldIcon';

/** Territory form; `groups` are the groups it may sit under (never itself or its own children). */
export function TerritoryFields({ groups }: { groups: DropdownOption[] }) {
  return (
    <FormSection title="Territory">
      <FormGrid columns={3}>
        <UppercaseField
          name="code"
          label="Territory code"
          required
          placeholder="e.g. S1, CHN"
          maxLength={10}
          autoFocus
          leftAddon={<FieldIcon name="tag" />}
        />
        <TextField
          name="name"
          label="Territory name"
          required
          placeholder="e.g. South Zone, Chennai"
          maxLength={80}
          leftAddon={<FieldIcon name="map" />}
        />
        <DropdownField
          name="parentId"
          label="Under group"
          options={groups}
          placeholder={groups.length ? 'Top level' : 'No groups yet'}
          clearable
          searchable
          disabled={groups.length === 0}
          leftIcon={<FieldIcon name="account_tree" />}
        />
        <CheckboxField
          name="isGroup"
          label="Is a group"
          checkboxDescription="Other territories can sit under it (branch node)"
        />
      </FormGrid>
    </FormSection>
  );
}

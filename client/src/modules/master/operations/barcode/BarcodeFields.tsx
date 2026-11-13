import { CheckboxField, DropdownField, FormGrid, FormSection, NumberField, TextField, UppercaseField } from '@/components/forms';
import { FieldIcon } from '../../shared/FieldIcon';
import { PRINTER_TYPES } from './barcode.schema';

export function BarcodeFields() {
  return (
    <>
      <FormSection title="Template Identity">
        <FormGrid columns={3}>
          <UppercaseField
            name="code"
            label="Template Code"
            required
            placeholder="e.g. LBL-50X25"
            maxLength={20}
            autoFocus
            leftAddon={<FieldIcon name="tag" />}
          />
          <TextField
            name="name"
            label="Template Name"
            required
            placeholder="e.g. Standard Shelf 50x25mm (2-Up)"
            maxLength={80}
            className="lg:col-span-2"
            leftAddon={<FieldIcon name="print" />}
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Label Dimensions & Layout">
        <FormGrid columns={3}>
          <NumberField
            name="paperWidthMm"
            label="Label Width (mm)"
            required
            min={10}
            placeholder="50"
          />
          <NumberField
            name="paperHeightMm"
            label="Label Height (mm)"
            required
            min={10}
            placeholder="25"
          />
          <NumberField
            name="columns"
            label="Sticker Columns"
            required
            min={1}
            placeholder="1 or 2"
          />
          <DropdownField
            name="printerType"
            label="Printer Technology"
            required
            className="lg:col-span-3"
            options={PRINTER_TYPES.map((p) => ({ value: p.value, label: p.label }))}
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Printed Elements">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <CheckboxField name="showPrice" label="Print MRP & Selling Price" />
          <CheckboxField name="showBarcode" label="Print Barcode & SKU" />
          <CheckboxField name="showStoreName" label="Print Shop Name Header" />
        </div>
      </FormSection>

      <CheckboxField name="active" label="Active template available for barcode printing" />
    </>
  );
}


import { useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { Form, useAppForm } from '@/components/forms';
import {
  COMPANY_PROFILE_DEFAULTS,
  companyProfileSchema,
  type CompanyProfileField,
  type CompanyProfileInput,
  type CompanyProfileValues,
} from '../config/companyProfile.schema';
import { CompanyProfileHeader, type CompanyFactKey } from './CompanyProfileHeader';
import { ContactTaxSection } from '../sections/ContactTaxSection';
import { IdentitySection } from '../sections/IdentitySection';
import { LocaleBillSection } from '../sections/LocaleBillSection';
import { PosBehaviourSection } from '../sections/PosBehaviourSection';
import { SectionNav } from './SectionNav';
import { SectionPanelHeader } from './SectionPanelHeader';
import { COMPANY_SECTIONS, firstSectionWithError, type CompanySectionKey } from '../config/sections';
import { STATE_OPTIONS } from '../config/options';

const SECTION_BODY: Record<CompanySectionKey, () => React.JSX.Element> = {
  identity: IdentitySection,
  contact: ContactTaxSection,
  locale: LocaleBillSection,
  pos: PosBehaviourSection,
};

const FORM_ID = 'company-profile-form';

/** Form field each header fact is edited in. */
const FACT_FIELD: Record<CompanyFactKey, CompanyProfileField> = {
  gstin: 'gstin',
  location: 'city',
  currency: 'currency',
  tax: 'taxPercent',
  maxDiscount: 'maxDiscount',
};

interface CompanyProfileFormProps {
  initialValues?: Partial<CompanyProfileInput>;
  shopId?: string;
  updatedOn: string;
  updatedBy: string;
  onSave: (values: CompanyProfileValues) => unknown | Promise<unknown>;
}

const stateLabel = (value?: string | null) => STATE_OPTIONS.find((option) => option.value === value)?.label;

/**
 * Company profile: summary header with save / reset, a section stepper and
 * the open section's fields. One react-hook-form instance holds all sections,
 * so switching sections keeps every value; a failed save opens the first
 * section with an error and focuses that field.
 */
export function CompanyProfileForm({ initialValues, shopId, updatedOn, updatedBy, onSave }: CompanyProfileFormProps) {
  const [active, setActive] = useState<CompanySectionKey>('identity');
  const form = useAppForm(companyProfileSchema, {
    defaultValues: { ...COMPANY_PROFILE_DEFAULTS, ...initialValues },
  });
  const { submitCount, errors, isSubmitting, dirtyFields } = form.formState;
  const unsavedCount = Object.keys(dirtyFields).length;
  const values = useWatch({ control: form.control });

  // Server data arrives after the first render: load it unless the user has started editing.
  useEffect(() => {
    if (initialValues && !form.formState.isDirty) form.reset({ ...COMPANY_PROFILE_DEFAULTS, ...initialValues });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the loaded values change
  }, [JSON.stringify(initialValues)]);

  // After a failed save, open the first section with an error and focus its first bad field.
  useEffect(() => {
    if (submitCount === 0) return;
    const section = firstSectionWithError(errors);
    if (!section) return;
    setActive(section.key);
    const field = section.fields.find((name) => errors[name]);
    if (field) setTimeout(() => form.setFocus(field), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per submit attempt
  }, [submitCount]);

  // After a successful save the saved values become the new baseline (clears "Unsaved changes").
  const submit = async (saved: CompanyProfileValues) => {
    await onSave(saved);
    form.reset(form.getValues());
  };

  // Clicking a fact in the header opens the section that holds its field and focuses it.
  const openField = (field: CompanyProfileField) => {
    const target = COMPANY_SECTIONS.find((item) => item.fields.includes(field));
    if (target) setActive(target.key);
    setTimeout(() => form.setFocus(field), 0);
  };

  const index = COMPANY_SECTIONS.findIndex((section) => section.key === active);
  const section = COMPANY_SECTIONS[index];
  const Body = SECTION_BODY[active];

  return (
    <Form form={form} onSubmit={submit} id={FORM_ID} className="space-y-3">
      <CompanyProfileHeader
        companyName={values.companyName || 'Your company'}
        shopId={shopId}
        updatedOn={updatedOn}
        updatedBy={updatedBy}
        facts={{
          gstin: typeof values.gstin === 'string' ? values.gstin : undefined,
          location: [values.city, stateLabel(values.state)].filter(Boolean).join(', '),
          currency: values.currency ? `${values.currency} · ${values.currencySign ?? ''}` : undefined,
          tax: values.taxPercent ? `GST ${values.taxPercent}%${values.taxInclusive ? ' incl.' : ''}` : undefined,
          maxDiscount: values.maxDiscount ? `${values.maxDiscount}%` : undefined,
        }}
        unsavedCount={unsavedCount}
        saving={isSubmitting}
        onReset={() => form.reset()}
        onFactSelect={(key) => openField(FACT_FIELD[key])}
      />

      <div className="bg-white border border-zinc-200 rounded-md p-3 sm:p-4 flex flex-col md:flex-row gap-4 md:gap-6 items-start">
        <SectionNav active={active} onSelect={setActive} />
        <section className="flex-1 w-full min-w-0" aria-label={section.label}>
          <SectionPanelHeader
            section={section}
            previous={COMPANY_SECTIONS[index - 1]}
            next={COMPANY_SECTIONS[index + 1]}
            onGo={(target) => setActive(target.key)}
          />
          <Body />
        </section>
      </div>
    </Form>
  );
}

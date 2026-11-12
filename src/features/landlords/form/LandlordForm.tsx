import { Label, ToggleButton, ToggleButtonGroup } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building, User } from 'lucide-react'
import { useMemo } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  FormDateField,
  FormNumberField,
  FormSelect,
  FormTextArea,
  FormTextField,
} from '@/components/form/fields'
import {
  FormActionBar,
  FormErrorSummary,
  FormSection,
  LeaveGuard,
} from '@/components/form/FormLayout'
import { useCountryName } from '@/lib/countries'
import type { Landlord, LandlordKind } from '../types'
import { type LandlordFormValues, makeLandlordSchema, residenceCountries } from './schema'

interface LandlordFormProps {
  defaultValues: LandlordFormValues
  /** Autres bailleurs (contrôle des doublons de téléphone) */
  others: Landlord[]
  submitLabel: string
  onSubmit: (values: LandlordFormValues) => Promise<void>
  onCancel: () => void
}

export function LandlordForm({
  defaultValues,
  others,
  submitLabel,
  onSubmit,
  onCancel,
}: LandlordFormProps) {
  const { t } = useTranslation()
  const countryName = useCountryName()
  // Le schéma (et ses messages) suit la langue active
  const schema = useMemo(() => makeLandlordSchema(t, others), [t, others])

  const {
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting, isSubmitSuccessful, submitCount, errors },
  } = useForm<LandlordFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onTouched',
  })

  const isCompany = useWatch({ control, name: 'kind' }) === 'company'
  const hasErrors = submitCount > 0 && Object.keys(errors).length > 0

  return (
    <form
      noValidate
      onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      className="flex flex-col gap-6"
    >
      <FormErrorSummary show={hasErrors} />

      <FormSection
        title={t('landlords.form.sections.identity')}
        hint={t('landlords.form.sections.identityHint')}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Controller
            control={control}
            name="kind"
            render={({ field }) => (
              <div className="flex flex-col gap-1 sm:col-span-2">
                <Label id="landlord-kind-label">{t('landlords.form.fields.kind')}</Label>
                <ToggleButtonGroup
                  aria-labelledby="landlord-kind-label"
                  selectionMode="single"
                  disallowEmptySelection
                  selectedKeys={new Set([field.value])}
                  onSelectionChange={(keys) => {
                    const [next] = keys
                    if (next) field.onChange(next as LandlordKind)
                  }}
                  className="self-start"
                >
                  <ToggleButton id="individual">
                    <User className="size-4" aria-hidden />
                    {t('landlords.kind.individual')}
                  </ToggleButton>
                  <ToggleButton id="company">
                    <ToggleButtonGroup.Separator />
                    <Building className="size-4" aria-hidden />
                    {t('landlords.kind.company')}
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
            )}
          />
          <FormTextField
            control={control}
            name="name"
            label={
              isCompany
                ? t('landlords.form.fields.companyName')
                : t('landlords.form.fields.fullName')
            }
            placeholder={
              isCompany
                ? t('landlords.form.fields.companyNamePlaceholder')
                : t('landlords.form.fields.fullNamePlaceholder')
            }
            autoComplete={isCompany ? 'organization' : 'name'}
            isRequired
          />
          {isCompany && (
            <FormTextField
              control={control}
              name="contactPerson"
              label={t('landlords.fields.contactPerson')}
              description={t('landlords.form.fields.contactPersonHint')}
            />
          )}
        </div>
      </FormSection>

      <FormSection
        title={t('landlords.form.sections.contact')}
        hint={t('landlords.form.sections.contactHint')}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormTextField
            control={control}
            name="phone"
            type="tel"
            autoComplete="tel"
            label={t('landlords.fields.phone')}
            placeholder="+221 77 123 45 67"
            description={t('landlords.form.fields.phoneHint')}
            isRequired
          />
          <FormTextField
            control={control}
            name="email"
            type="email"
            autoComplete="email"
            label={t('landlords.fields.email')}
            description={t('landlords.form.fields.emailHint')}
            isRequired
          />
          <FormTextField
            control={control}
            name="city"
            label={t('landlords.fields.city')}
            autoComplete="address-level2"
          />
          <FormSelect
            control={control}
            name="country"
            label={t('landlords.fields.country')}
            options={residenceCountries
              .map((c) => ({ id: c, label: countryName(c) }))
              .sort((a, b) => a.label.localeCompare(b.label))}
          />
        </div>
      </FormSection>

      <FormSection
        title={t('landlords.form.sections.mandate')}
        hint={t('landlords.form.sections.mandateHint')}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormDateField
            control={control}
            name="mandateStart"
            label={t('landlords.fields.mandateStart')}
          />
          <FormNumberField
            control={control}
            name="feeRate"
            label={t('landlords.form.fields.feeRate')}
            description={t('landlords.form.fields.feeRateHint')}
            minValue={0}
            formatOptions={{ maximumFractionDigits: 2 }}
          />
        </div>
      </FormSection>

      <FormSection
        title={t('landlords.fields.notes')}
        hint={t('landlords.form.sections.notesHint')}
      >
        <FormTextArea
          control={control}
          name="notes"
          label={t('landlords.fields.notes')}
          placeholder={t('landlords.form.fields.notesPlaceholder')}
        />
      </FormSection>

      <FormActionBar submitLabel={submitLabel} isSubmitting={isSubmitting} onCancel={onCancel} />

      {/* Prévenir avant de quitter avec des modifications non enregistrées */}
      <LeaveGuard when={isDirty && !isSubmitting && !isSubmitSuccessful} />
    </form>
  )
}

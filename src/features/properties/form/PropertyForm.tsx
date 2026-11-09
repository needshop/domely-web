import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FormDateField, FormSelect, FormTextArea, FormTextField } from '@/components/form/fields'
import {
  FormActionBar,
  FormErrorSummary,
  FormSection as Section,
  LeaveGuard,
} from '@/components/form/FormLayout'
import { supportedCountries, useCountryName } from '@/lib/countries'
import { propertyTypes } from '../types'
import { isSingleUnitType, makePropertySchema, type PropertyFormValues } from './schema'
import { UnitsFieldArray } from './UnitsFieldArray'

interface PropertyFormProps {
  defaultValues: PropertyFormValues
  submitLabel: string
  onSubmit: (values: PropertyFormValues) => Promise<void>
  onCancel: () => void
}

export function PropertyForm({
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel,
}: PropertyFormProps) {
  const { t } = useTranslation()
  const countryName = useCountryName()
  // Le schéma (et ses messages) suit la langue active
  const schema = useMemo(() => makePropertySchema(t), [t])

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { isDirty, isSubmitting, isSubmitSuccessful, submitCount, errors },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onTouched',
  })

  const type = useWatch({ control, name: 'type' })

  // Passage à un type à lot unique (appartement, maison) : si le bien n'a qu'un lot libre,
  // on aligne sa nature ; s'il en a plusieurs, le schéma signale les lots en trop.
  useEffect(() => {
    if (!isSingleUnitType(type)) return
    const units = getValues('units')
    if (units.length === 1 && units[0].status !== 'rented' && units[0].kind !== type) {
      setValue('units.0.kind', type as 'apartment' | 'house', { shouldDirty: true })
    }
  }, [type, getValues, setValue])

  const hasErrors = submitCount > 0 && Object.keys(errors).length > 0

  return (
    <form
      noValidate
      onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      className="flex flex-col gap-6"
    >
      <FormErrorSummary show={hasErrors} />

      <Section
        title={t('properties.form.sections.general')}
        hint={t('properties.form.sections.generalHint')}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormTextField
            control={control}
            name="name"
            label={t('properties.form.fields.name')}
            placeholder={t('properties.form.fields.namePlaceholder')}
            isRequired
          />
          <FormSelect
            control={control}
            name="type"
            label={t('properties.form.fields.type')}
            options={propertyTypes.map((pt) => ({ id: pt, label: t(`properties.type.${pt}`) }))}
            isRequired
          />
          <FormDateField
            control={control}
            name="acquiredAt"
            label={t('properties.form.fields.acquiredAt')}
          />
          <FormTextArea
            control={control}
            name="description"
            label={t('properties.form.fields.description')}
            placeholder={t('properties.form.fields.descriptionPlaceholder')}
            className="sm:col-span-2"
          />
        </div>
      </Section>

      <Section
        title={t('properties.form.sections.address')}
        hint={t('properties.form.sections.addressHint')}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormTextField
            control={control}
            name="address.street"
            label={t('properties.form.fields.street')}
            placeholder={t('properties.form.fields.streetPlaceholder')}
            isRequired
            className="sm:col-span-2"
          />
          <FormTextField
            control={control}
            name="address.district"
            label={t('properties.form.fields.district')}
            placeholder={t('properties.form.fields.districtPlaceholder')}
          />
          <FormTextField
            control={control}
            name="address.city"
            label={t('properties.form.fields.city')}
            placeholder={t('properties.form.fields.cityPlaceholder')}
            isRequired
          />
          <FormSelect
            control={control}
            name="address.country"
            label={t('properties.form.fields.country')}
            options={supportedCountries
              .map((c) => ({ id: c, label: countryName(c) }))
              .sort((a, b) => a.label.localeCompare(b.label))}
            isRequired
          />
        </div>
      </Section>

      <Section
        title={t('properties.form.sections.units')}
        hint={
          isSingleUnitType(type)
            ? t('properties.form.sections.unitsSingleHint')
            : t('properties.form.sections.unitsHint')
        }
      >
        <UnitsFieldArray control={control} />
      </Section>

      <FormActionBar submitLabel={submitLabel} isSubmitting={isSubmitting} onCancel={onCancel} />

      {/* Prévenir avant de quitter avec des modifications non enregistrées */}
      <LeaveGuard when={isDirty && !isSubmitting && !isSubmitSuccessful} />
    </form>
  )
}

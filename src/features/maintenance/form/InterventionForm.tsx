import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
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
import type { Property } from '@/features/properties/types'
import type { Tenant } from '@/features/tenants/types'
import { BASE_CURRENCY } from '@/lib/currency'
import { costBearers, maintenanceCategories, maintenancePriorities, reporterKinds } from '../types'
import { COMMON_AREAS, type InterventionFormValues, makeInterventionSchema } from './schema'

const amountFormat: Intl.NumberFormatOptions = {
  style: 'currency',
  currency: BASE_CURRENCY,
  maximumFractionDigits: 0,
}

interface InterventionFormProps {
  defaultValues: InterventionFormValues
  properties: Property[]
  tenants: Tenant[]
  submitLabel: string
  onSubmit: (values: InterventionFormValues) => Promise<void>
  onCancel: () => void
}

export function InterventionForm({
  defaultValues,
  properties,
  tenants,
  submitLabel,
  onSubmit,
  onCancel,
}: InterventionFormProps) {
  const { t } = useTranslation()
  const schema = useMemo(() => makeInterventionSchema(t), [t])

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { isDirty, isSubmitting, isSubmitSuccessful, submitCount, errors },
  } = useForm<InterventionFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onTouched',
  })

  const [propertyId, unitId, reportedBy] = useWatch({
    control,
    name: ['propertyId', 'unitId', 'reportedBy'],
  })
  const property = properties.find((p) => p.id === propertyId)
  const unit = property?.units.find((u) => u.id === unitId)
  const unitTenant = tenants.find((tn) => tn.id === unit?.lease?.tenantId)

  // Changement de bien : on revient aux parties communes si le lot n'en fait plus partie
  const previousProperty = useRef(propertyId)
  useEffect(() => {
    if (previousProperty.current === propertyId) return
    previousProperty.current = propertyId
    const current = getValues('unitId')
    if (current !== COMMON_AREAS && !property?.units.some((u) => u.id === current)) {
      setValue('unitId', property ? COMMON_AREAS : null, { shouldDirty: true })
    }
  }, [propertyId, property, getValues, setValue])

  const hasErrors = submitCount > 0 && Object.keys(errors).length > 0

  return (
    <form
      noValidate
      onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      className="flex flex-col gap-6"
    >
      <FormErrorSummary show={hasErrors} />

      <FormSection
        title={t('maintenance.form.sections.request')}
        hint={t('maintenance.form.sections.requestHint')}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormTextField
            control={control}
            name="title"
            label={t('maintenance.fields.title')}
            placeholder={t('maintenance.form.titlePlaceholder')}
            className="sm:col-span-2"
            isRequired
          />
          <FormSelect
            control={control}
            name="propertyId"
            label={t('contracts.form.fields.property')}
            options={[...properties]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((p) => ({ id: p.id, label: p.name }))}
            isRequired
          />
          <FormSelect
            control={control}
            name="unitId"
            label={t('maintenance.fields.unit')}
            description={property ? undefined : t('contracts.form.fields.unitHint')}
            options={
              property
                ? [
                    { id: COMMON_AREAS, label: t('maintenance.commonAreas') },
                    ...property.units.map((u) => ({ id: u.id, label: u.label })),
                  ]
                : []
            }
            isDisabled={!property}
            isRequired
          />
          <FormSelect
            control={control}
            name="category"
            label={t('maintenance.fields.category')}
            options={maintenanceCategories.map((c) => ({
              id: c,
              label: t(`maintenance.category.${c}`),
            }))}
            isRequired
          />
          <FormSelect
            control={control}
            name="priority"
            label={t('maintenance.fields.priority')}
            options={maintenancePriorities.map((p) => ({
              id: p,
              label: t(`maintenance.priority.${p}`),
            }))}
            isRequired
          />
          <FormTextArea
            control={control}
            name="description"
            label={t('maintenance.fields.description')}
            placeholder={t('maintenance.form.descriptionPlaceholder')}
            className="sm:col-span-2"
          />
          <FormSelect
            control={control}
            name="reportedBy"
            label={t('maintenance.fields.reportedBy')}
            description={
              reportedBy === 'tenant'
                ? unitTenant
                  ? unitTenant.name
                  : t('maintenance.form.noTenant')
                : undefined
            }
            options={reporterKinds.map((r) => ({ id: r, label: t(`maintenance.reporter.${r}`) }))}
            isRequired
          />
          <FormDateField
            control={control}
            name="reportedAt"
            label={t('maintenance.fields.reportedAt')}
            isRequired
          />
        </div>
      </FormSection>

      <FormSection
        title={t('maintenance.detail.planning')}
        hint={t('maintenance.form.sections.planningHint')}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormDateField
            control={control}
            name="scheduledAt"
            label={t('maintenance.fields.scheduledAt')}
          />
          <FormNumberField
            control={control}
            name="estimatedCost"
            label={t('maintenance.fields.estimatedCost')}
            formatOptions={amountFormat}
            minValue={0}
          />
          <FormTextField
            control={control}
            name="providerName"
            label={t('maintenance.fields.providerName')}
            placeholder={t('maintenance.form.providerPlaceholder')}
          />
          <FormTextField
            control={control}
            name="providerPhone"
            type="tel"
            label={t('maintenance.fields.providerPhone')}
          />
          <FormSelect
            control={control}
            name="chargedTo"
            label={t('maintenance.fields.chargedTo')}
            options={costBearers.map((b) => ({ id: b, label: t(`maintenance.bearer.${b}`) }))}
            isRequired
          />
        </div>
      </FormSection>

      <FormActionBar submitLabel={submitLabel} isSubmitting={isSubmitting} onCancel={onCancel} />
      <LeaveGuard when={isDirty && !isSubmitting && !isSubmitSuccessful} />
    </form>
  )
}

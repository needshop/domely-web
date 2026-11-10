import { zodResolver } from '@hookform/resolvers/zod'
import { Lock } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  FormComboBox,
  FormDateField,
  FormNumberField,
  FormSelect,
  FormSwitch,
  FormTextArea,
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
import { durationInMonths } from '@/lib/dates'
import { useFormatters } from '@/lib/format'
import { type Lease, leaseTypes } from '../types'
import { defaultDeposit, defaultEndDate, unitDefaults } from './mapping'
import { type LeaseFormValues, makeLeaseSchema } from './schema'

const amountFormat: Intl.NumberFormatOptions = {
  style: 'currency',
  currency: BASE_CURRENCY,
  maximumFractionDigits: 0,
}

interface ContractFormProps {
  defaultValues: LeaseFormValues
  /** Modification : le locataire et le lot ne changent pas (sinon, nouveau contrat) */
  isEdit: boolean
  tenants: Tenant[]
  /** Biens avec la situation locative des lots */
  properties: Property[]
  /** Autres contrats (contrôle des chevauchements) */
  others: Lease[]
  submitLabel: string
  onSubmit: (values: LeaseFormValues) => Promise<void>
  onCancel: () => void
}

export function ContractForm({
  defaultValues,
  isEdit,
  tenants,
  properties,
  others,
  submitLabel,
  onSubmit,
  onCancel,
}: ContractFormProps) {
  const { t } = useTranslation()
  const f = useFormatters()
  const formatDate = f.dayMonthYear
  const schema = useMemo(
    () =>
      makeLeaseSchema(t, {
        others,
        properties,
        formatDate: (iso) => formatDate(new Date(`${iso}T12:00:00`)),
      }),
    [t, others, properties, formatDate],
  )

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { isDirty, isSubmitting, isSubmitSuccessful, submitCount, errors },
  } = useForm<LeaseFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onTouched',
  })

  const [propertyId, unitId, startDate, endDate, rent, type] = useWatch({
    control,
    name: ['propertyId', 'unitId', 'startDate', 'endDate', 'rent', 'type'],
  })
  const property = properties.find((p) => p.id === propertyId)
  const unit = property?.units.find((u) => u.id === unitId)
  const tenant = tenants.find((tn) => tn.id === getValues('tenantId'))

  // Changement de bien : le lot choisi n'en fait plus partie
  const previousProperty = useRef(propertyId)
  useEffect(() => {
    if (previousProperty.current === propertyId) return
    previousProperty.current = propertyId
    if (!property?.units.some((u) => u.id === getValues('unitId'))) {
      // Bien à lot unique : on le sélectionne directement
      setValue('unitId', property?.units.length === 1 ? property.units[0].id : null, {
        shouldDirty: true,
      })
    }
  }, [propertyId, property, getValues, setValue])

  // Choix d'un lot : on propose sa nature de bail, son loyer et ses charges
  const previousUnit = useRef(unitId)
  useEffect(() => {
    if (previousUnit.current === unitId) return
    previousUnit.current = unitId
    if (!unit || isEdit) return
    const defaults = unitDefaults(unit)
    for (const key of ['type', 'rent', 'charges', 'deposit'] as const) {
      setValue(key, defaults[key], { shouldDirty: true })
    }
  }, [unitId, unit, isEdit, setValue])

  // Loyer ou nature modifiés : le dépôt suit l'usage (2 ou 3 mois), sauf s'il a été personnalisé
  const previousTerms = useRef({ rent, type })
  useEffect(() => {
    const prev = previousTerms.current
    if (prev.rent === rent && prev.type === type) return
    previousTerms.current = { rent, type }
    const deposit = getValues('deposit')
    const followsUsage =
      deposit === null || (prev.rent !== null && deposit === defaultDeposit(prev.rent, prev.type))
    if (followsUsage && rent) {
      setValue('deposit', defaultDeposit(rent, type), { shouldDirty: true })
    }
  }, [rent, type, getValues, setValue])

  // Début modifié : fin proposée un an plus tard si elle n'est plus cohérente
  const previousStart = useRef(startDate)
  useEffect(() => {
    if (previousStart.current === startDate) return
    previousStart.current = startDate
    const end = getValues('endDate')
    if (startDate && (!end || end <= startDate)) {
      setValue('endDate', defaultEndDate(startDate), { shouldDirty: true })
    }
  }, [startDate, getValues, setValue])

  const months =
    startDate && endDate && endDate > startDate ? durationInMonths(startDate, endDate) : 0
  const hasErrors = submitCount > 0 && Object.keys(errors).length > 0

  const unitOption = (u: Property['units'][number]) => {
    const state =
      u.status === 'rented'
        ? t('contracts.form.unitRented', {
            date: u.lease ? formatDate(new Date(`${u.lease.endDate}T12:00:00`)) : '—',
          })
        : t(`properties.unitStatus.${u.status}`)
    return { id: u.id, label: `${u.label} — ${state}` }
  }

  return (
    <form
      noValidate
      onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      className="flex flex-col gap-6"
    >
      <FormErrorSummary show={hasErrors} />

      <FormSection
        title={t('contracts.form.sections.parties')}
        hint={
          isEdit
            ? t('contracts.form.sections.partiesLocked')
            : t('contracts.form.sections.partiesHint')
        }
      >
        {isEdit ? (
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted">{t('contracts.form.fields.tenant')}</dt>
              <dd className="flex items-center gap-1.5 text-sm">
                <Lock className="size-3.5 text-muted" aria-hidden />
                {tenant?.name ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">{t('contracts.form.fields.unit')}</dt>
              <dd className="flex items-center gap-1.5 text-sm">
                <Lock className="size-3.5 text-muted" aria-hidden />
                {property?.name ?? '—'} · {unit?.label ?? '—'}
              </dd>
            </div>
          </dl>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            <FormComboBox
              control={control}
              name="tenantId"
              label={t('contracts.form.fields.tenant')}
              placeholder={t('contracts.form.fields.tenantPlaceholder')}
              emptyLabel={t('contracts.form.fields.noTenant')}
              options={[...tenants]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((tn) => ({ id: tn.id, label: tn.name }))}
              className="sm:col-span-2"
              isRequired
            />
            <FormSelect
              control={control}
              name="propertyId"
              label={t('contracts.form.fields.property')}
              options={[...properties]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((p) => {
                  const vacant = p.units.filter((u) => u.status === 'vacant').length
                  return {
                    id: p.id,
                    label: `${p.name} — ${t('contracts.form.vacantUnits', { count: vacant })}`,
                  }
                })}
              isRequired
            />
            <FormSelect
              control={control}
              name="unitId"
              label={t('contracts.form.fields.unit')}
              description={property ? undefined : t('contracts.form.fields.unitHint')}
              options={property?.units.map(unitOption) ?? []}
              isDisabled={!property}
              isRequired
            />
          </div>
        )}
      </FormSection>

      <FormSection
        title={t('contracts.form.sections.period')}
        hint={t('contracts.form.sections.periodHint')}
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <FormSelect
            control={control}
            name="type"
            label={t('contracts.form.fields.type')}
            options={leaseTypes.map((lt) => ({ id: lt, label: t(`contracts.type.${lt}`) }))}
            isRequired
          />
          <FormDateField
            control={control}
            name="startDate"
            label={t('contracts.form.fields.startDate')}
            isRequired
          />
          <FormDateField
            control={control}
            name="endDate"
            label={t('contracts.form.fields.endDate')}
            description={months ? t('contracts.duration', { count: months }) : undefined}
            isRequired
          />
          <FormSwitch
            control={control}
            name="tacitRenewal"
            label={t('contracts.form.fields.tacitRenewal')}
            description={t('contracts.form.fields.tacitRenewalHint')}
            className="sm:col-span-3"
          />
        </div>
      </FormSection>

      <FormSection
        title={t('contracts.form.sections.financial')}
        hint={t('properties.form.fields.amountsHint')}
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <FormNumberField
            control={control}
            name="rent"
            label={t('properties.form.fields.rent')}
            formatOptions={amountFormat}
            minValue={0}
            step={5_000}
            isRequired
          />
          <FormNumberField
            control={control}
            name="charges"
            label={t('properties.form.fields.charges')}
            formatOptions={amountFormat}
            minValue={0}
            step={1_000}
          />
          <FormNumberField
            control={control}
            name="deposit"
            label={t('contracts.form.fields.deposit')}
            description={t('contracts.form.fields.depositHint')}
            formatOptions={amountFormat}
            minValue={0}
            step={5_000}
          />
          <FormNumberField
            control={control}
            name="paymentDay"
            label={t('contracts.form.fields.paymentDay')}
            description={t('contracts.form.fields.paymentDayHint')}
            minValue={1}
            isRequired
          />
        </div>
      </FormSection>

      <FormSection
        title={t('tenants.detail.contact.notes')}
        hint={t('tenants.form.sections.notesHint')}
      >
        <FormTextArea
          control={control}
          name="notes"
          label={t('tenants.detail.contact.notes')}
          placeholder={t('contracts.form.fields.notesPlaceholder')}
        />
      </FormSection>

      <FormActionBar submitLabel={submitLabel} isSubmitting={isSubmitting} onCancel={onCancel} />

      {/* Prévenir avant de quitter avec des modifications non enregistrées */}
      <LeaveGuard when={isDirty && !isSubmitting && !isSubmitSuccessful} />
    </form>
  )
}

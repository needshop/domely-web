import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { FormNumberField, FormSelect, FormSwitch } from '@/components/form/fields'
import { LeaveGuard } from '@/components/form/FormLayout'
import { updateSettings, useSettings } from '../api'
import { leaseDurations } from '../types'
import { SettingsCard } from './SettingsCard'
import { useSettingsForm } from './useSettingsForm'

/** Valeurs proposées à la création d'un contrat. */
export function RentalSettings() {
  const { t } = useTranslation()
  const { rentals } = useSettings()
  const schema = useMemo(() => {
    const months = z
      .number({ error: t('form.errors.required') })
      .int()
      .min(0, { error: t('properties.form.errors.min0') })
      .max(12, { error: t('settings.rentals.errors.depositMax') })
    return z.object({
      paymentDay: z
        .number({ error: t('form.errors.required') })
        .int()
        .min(1, { error: t('contracts.form.errors.paymentDay') })
        .max(28, { error: t('contracts.form.errors.paymentDay') }),
      // Durée choisie dans un Select (clé texte), convertie en nombre à l'enregistrement
      leaseMonths: z.string(),
      tacitRenewal: z.boolean(),
      depositMonthsResidential: months,
      depositMonthsCommercial: months,
    })
  }, [t])

  const { control, onSubmit, formState } = useSettingsForm(
    schema,
    { ...rentals, leaseMonths: String(rentals.leaseMonths) },
    (v) => updateSettings('rentals', { ...v, leaseMonths: Number(v.leaseMonths) }),
  )

  return (
    <SettingsCard
      title={t('settings.rentals.title')}
      description={t('settings.rentals.description')}
      isSubmitting={formState.isSubmitting}
      onSubmit={onSubmit}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FormNumberField
          control={control}
          name="paymentDay"
          label={t('contracts.form.fields.paymentDay')}
          description={t('contracts.form.fields.paymentDayHint')}
          minValue={1}
          isRequired
        />
        <FormSelect
          control={control}
          name="leaseMonths"
          label={t('settings.rentals.leaseMonths')}
          options={leaseDurations.map((m) => ({
            id: String(m),
            label: t('contracts.duration', { count: m }),
          }))}
          isRequired
        />
        <FormNumberField
          control={control}
          name="depositMonthsResidential"
          label={t('settings.rentals.depositResidential')}
          description={t('settings.rentals.depositHint')}
          minValue={0}
          isRequired
        />
        <FormNumberField
          control={control}
          name="depositMonthsCommercial"
          label={t('settings.rentals.depositCommercial')}
          description={t('settings.rentals.depositHint')}
          minValue={0}
          isRequired
        />
        <FormSwitch
          control={control}
          name="tacitRenewal"
          label={t('contracts.form.fields.tacitRenewal')}
          description={t('settings.rentals.tacitRenewalHint')}
          className="sm:col-span-2"
        />
      </div>
      <LeaveGuard when={formState.isDirty && !formState.isSubmitting} />
    </SettingsCard>
  )
}

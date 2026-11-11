import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { FormSelect, FormTextField } from '@/components/form/fields'
import { LeaveGuard } from '@/components/form/FormLayout'
import { supportedCountries, useCountryName } from '@/lib/countries'
import { updateSettings, useSettings } from '../api'
import { type Organization, organizationKinds } from '../types'
import { SettingsCard } from './SettingsCard'
import { useSettingsForm } from './useSettingsForm'

export function OrganizationSettings() {
  const { t } = useTranslation()
  const countryName = useCountryName()
  const { organization } = useSettings()
  const schema = useMemo(
    () =>
      z.object({
        kind: z.enum(organizationKinds),
        name: z.string().trim().max(120),
        country: z.string(),
        city: z.string().trim().max(80),
        address: z.string().trim().max(200),
        registration: z.string().trim().max(60),
        phone: z.string().trim().max(30),
        email: z.union([z.literal(''), z.email({ error: t('form.errors.invalidEmail') })]),
      }) satisfies z.ZodType<Organization, Organization>,
    [t],
  )
  const { control, onSubmit, formState, watch } = useSettingsForm(schema, organization, (v) =>
    updateSettings('organization', v),
  )
  const kind = watch('kind')

  return (
    <SettingsCard
      title={t('settings.organization.title')}
      description={t('settings.organization.description')}
      isSubmitting={formState.isSubmitting}
      onSubmit={onSubmit}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FormSelect
          control={control}
          name="kind"
          label={t('settings.organization.kind')}
          options={organizationKinds.map((k) => ({
            id: k,
            label: t(`settings.organization.kinds.${k}`),
          }))}
          isRequired
        />
        <FormTextField
          control={control}
          name="name"
          label={
            kind === 'individual'
              ? t('settings.organization.nameIndividual')
              : t('settings.organization.name')
          }
          description={t('settings.organization.nameHint')}
          autoComplete="organization"
        />
        <FormTextField
          control={control}
          name="registration"
          label={t('settings.organization.registration')}
          placeholder={t('settings.organization.registrationPlaceholder')}
        />
        <FormSelect
          control={control}
          name="country"
          label={t('properties.form.fields.country')}
          options={supportedCountries
            .map((c) => ({ id: c, label: countryName(c) }))
            .sort((a, b) => a.label.localeCompare(b.label))}
          isRequired
        />
        <FormTextField control={control} name="city" label={t('properties.form.fields.city')} />
        <FormTextField
          control={control}
          name="address"
          label={t('settings.organization.address')}
          autoComplete="street-address"
        />
        <FormTextField
          control={control}
          name="phone"
          type="tel"
          label={t('tenants.detail.contact.phone')}
        />
        <FormTextField
          control={control}
          name="email"
          type="email"
          label={t('tenants.detail.contact.email')}
        />
      </div>
      <LeaveGuard when={formState.isDirty && !formState.isSubmitting} />
    </SettingsCard>
  )
}

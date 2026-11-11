import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { FormTextField } from '@/components/form/fields'
import { LeaveGuard } from '@/components/form/FormLayout'
import { updateSettings, useSettings } from '../api'
import type { Profile } from '../types'
import { SettingsCard } from './SettingsCard'
import { useSettingsForm } from './useSettingsForm'

export function ProfileSettings() {
  const { t } = useTranslation()
  const { profile } = useSettings()
  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().max(120),
        email: z.union([z.literal(''), z.email({ error: t('form.errors.invalidEmail') })]),
        phone: z.string().trim().max(30),
      }) satisfies z.ZodType<Profile, Profile>,
    [t],
  )
  const { control, onSubmit, formState } = useSettingsForm(schema, profile, (v) =>
    updateSettings('profile', v),
  )

  return (
    <SettingsCard
      title={t('settings.profile.title')}
      description={t('settings.profile.description')}
      isSubmitting={formState.isSubmitting}
      onSubmit={onSubmit}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FormTextField
          control={control}
          name="name"
          label={t('settings.profile.name')}
          description={t('settings.profile.nameHint')}
          autoComplete="name"
          className="sm:col-span-2"
        />
        <FormTextField
          control={control}
          name="email"
          type="email"
          autoComplete="email"
          label={t('tenants.detail.contact.email')}
        />
        <FormTextField
          control={control}
          name="phone"
          type="tel"
          autoComplete="tel"
          label={t('tenants.detail.contact.phone')}
        />
      </div>
      <LeaveGuard when={formState.isDirty && !formState.isSubmitting} />
    </SettingsCard>
  )
}

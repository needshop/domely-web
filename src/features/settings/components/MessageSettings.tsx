import { Button, Chip } from '@heroui/react'
import { RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { FormTextArea } from '@/components/form/fields'
import { LeaveGuard } from '@/components/form/FormLayout'
import { useFormatters } from '@/lib/format'
import { updateSettings, useSettings } from '../api'
import { fillTemplate, reminderVariables, signature } from '../reminderMessage'
import { SettingsCard } from './SettingsCard'
import { useSettingsForm } from './useSettingsForm'

/** Modèle du message de relance des impayés, avec aperçu. */
export function MessageSettings() {
  const { t } = useTranslation()
  const f = useFormatters()
  const { reminder, organization } = useSettings()

  // Modèle par défaut de la langue active, avec ses variables laissées en clair
  const defaultTemplate = t('rents.reminder.template', {
    name: '{{name}}',
    month: '{{month}}',
    unit: '{{unit}}',
    property: '{{property}}',
    amount: '{{amount}}',
    date: '{{date}}',
    interpolation: { escapeValue: false },
  })

  const schema = useMemo(
    () =>
      z.object({
        template: z
          .string()
          .trim()
          .min(1, { error: t('form.errors.required') })
          .max(2000),
      }),
    [t],
  )
  const { control, onSubmit, formState, watch, setValue } = useSettingsForm(
    schema,
    { template: reminder.template || defaultTemplate },
    // Identique au modèle par défaut : on n'enregistre rien, pour suivre la langue active
    (v) =>
      updateSettings('reminder', {
        template: v.template.trim() === defaultTemplate.trim() ? '' : v.template,
      }),
  )
  const template = watch('template')

  // Exemple fixe pour l'aperçu (date du jour figée au montage)
  const [sampleDate] = useState(() => new Date())
  const sample = {
    name: 'Awa Diallo',
    month: f.monthLong(sampleDate),
    unit: 'Apt 4',
    property: 'Résidence Les Oliviers',
    amount: f.moneyExact(383_000),
    date: f.dayMonthYear(sampleDate),
  }
  const sign = signature(organization)
  const preview = `${fillTemplate(template ?? '', sample)}${sign ? `\n${sign}` : ''}`

  return (
    <SettingsCard
      title={t('settings.messages.title')}
      description={t('settings.messages.description')}
      isSubmitting={formState.isSubmitting}
      onSubmit={onSubmit}
      footer={
        <Button
          variant="tertiary"
          isDisabled={template?.trim() === defaultTemplate.trim()}
          onPress={() => setValue('template', defaultTemplate, { shouldDirty: true })}
        >
          <RotateCcw className="size-4" aria-hidden />
          {t('settings.messages.restore')}
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <FormTextArea
            control={control}
            name="template"
            label={t('settings.messages.template')}
            rows={12}
            isRequired
          />
          <div>
            <p className="mb-1.5 text-xs text-muted">{t('settings.messages.variables')}</p>
            <div className="flex flex-wrap gap-1.5">
              {reminderVariables.map((v) => (
                <Chip key={v} size="sm" variant="soft">
                  {`{{${v}}}`} · {t(`settings.messages.variable.${v}`)}
                </Chip>
              ))}
            </div>
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-sm font-medium">{t('settings.messages.preview')}</p>
          <div className="rounded-xl bg-default px-4 py-3 text-sm whitespace-pre-wrap">
            {preview}
          </div>
          <p className="mt-2 text-xs text-muted">
            {sign ? t('settings.messages.signatureHint') : t('settings.messages.noSignature')}
          </p>
        </div>
      </div>
      <LeaveGuard when={formState.isDirty && !formState.isSubmitting} />
    </SettingsCard>
  )
}

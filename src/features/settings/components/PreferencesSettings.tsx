import { Button, Modal, toast } from '@heroui/react'
import { RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { CurrencySwitcher } from '@/components/CurrencySwitcher'
import { FormNumberField } from '@/components/form/fields'
import { LeaveGuard } from '@/components/form/FormLayout'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { XOF_PER_EUR } from '@/lib/currency'
import { resetSettings, updateSettings, useSettings } from '../api'
import { SettingsCard } from './SettingsCard'
import { useSettingsForm } from './useSettingsForm'

function PreferenceRow({
  label,
  description,
  children,
}: {
  label: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

/** Langue, devise et thème (appliqués immédiatement), taux de change, réinitialisation. */
export function PreferencesSettings() {
  const { t, i18n } = useTranslation()
  const { exchangeRates } = useSettings()
  const [confirmReset, setConfirmReset] = useState(false)
  const decimal = new Intl.NumberFormat(i18n.resolvedLanguage === 'en' ? 'en-US' : 'fr-FR', {
    maximumFractionDigits: 3,
  })

  const schema = useMemo(
    () =>
      z.object({
        GNF: z
          .number({ error: t('form.errors.required') })
          .refine((v) => v > 0, { error: t('properties.form.errors.positive') }),
      }),
    [t],
  )
  const { control, onSubmit, formState } = useSettingsForm(schema, exchangeRates, (v) =>
    updateSettings('exchangeRates', v),
  )

  return (
    <div className="flex flex-col gap-6">
      <SettingsCard
        title={t('settings.preferences.title')}
        description={t('settings.preferences.description')}
      >
        <div className="divide-y divide-separator">
          <PreferenceRow
            label={t('settings.preferences.language')}
            description={t('settings.preferences.languageHint')}
          >
            <LanguageSwitcher />
          </PreferenceRow>
          <PreferenceRow
            label={t('settings.preferences.currency')}
            description={t('settings.preferences.currencyHint')}
          >
            <CurrencySwitcher />
          </PreferenceRow>
          <PreferenceRow
            label={t('settings.preferences.theme')}
            description={t('settings.preferences.themeHint')}
          >
            <ThemeSwitcher />
          </PreferenceRow>
        </div>
      </SettingsCard>

      <SettingsCard
        title={t('settings.rates.title')}
        description={t('settings.rates.description')}
        isSubmitting={formState.isSubmitting}
        onSubmit={onSubmit}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">{t('settings.rates.eur')}</p>
            <p className="flex h-10 items-center text-sm tabular-nums">
              1 € = {decimal.format(XOF_PER_EUR)} F CFA
            </p>
            <p className="text-xs text-muted">{t('settings.rates.eurHint')}</p>
          </div>
          <FormNumberField
            control={control}
            name="GNF"
            label={t('settings.rates.gnf')}
            description={t('settings.rates.gnfHint')}
            formatOptions={{ maximumFractionDigits: 4 }}
            minValue={0}
            isRequired
          />
        </div>
        <LeaveGuard when={formState.isDirty && !formState.isSubmitting} />
      </SettingsCard>

      <SettingsCard title={t('settings.reset.title')} description={t('settings.reset.description')}>
        <Button variant="danger-soft" onPress={() => setConfirmReset(true)}>
          <RotateCcw className="size-4" aria-hidden />
          {t('settings.reset.action')}
        </Button>
      </SettingsCard>

      <Modal.Backdrop isOpen={confirmReset} onOpenChange={setConfirmReset}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-sm">
            <Modal.Header>
              <Modal.Heading>{t('settings.reset.confirmTitle')}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="text-sm text-muted">{t('settings.reset.confirmDescription')}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="tertiary" onPress={() => setConfirmReset(false)}>
                {t('form.actions.cancel')}
              </Button>
              <Button
                variant="danger"
                onPress={() => {
                  void resetSettings()
                  setConfirmReset(false)
                  toast.success(t('settings.reset.done'))
                }}
              >
                {t('settings.reset.confirm')}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  )
}

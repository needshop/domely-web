import { ToggleButton, ToggleButtonGroup } from '@heroui/react'
import { useTranslation } from 'react-i18next'
import { supportedLanguages } from '@/i18n'

/** Bascule FR / EN. Le choix est mémorisé par le détecteur i18next (localStorage « domely-lang »). */
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const current = i18n.resolvedLanguage ?? 'fr'

  return (
    <ToggleButtonGroup
      aria-label={t('language.label')}
      size="sm"
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={new Set([current])}
      onSelectionChange={(keys) => {
        const [next] = keys
        if (next) void i18n.changeLanguage(String(next))
      }}
    >
      {supportedLanguages.map((lng, index) => (
        <ToggleButton key={lng} id={lng} aria-label={t(`language.${lng}`)} className="font-display">
          {index > 0 && <ToggleButtonGroup.Separator />}
          {lng.toUpperCase()}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}

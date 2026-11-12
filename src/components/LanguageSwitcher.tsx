import { ListBox, Select } from '@heroui/react'
import { useTranslation } from 'react-i18next'
import { supportedLanguages } from '@/i18n'
import { cn } from '@/lib/cn'

/**
 * Sélecteur de langue (FR / EN), même présentation que le sélecteur de devise.
 * Le choix est mémorisé par le détecteur i18next (localStorage « domely-lang »).
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { t, i18n } = useTranslation()
  const current = i18n.resolvedLanguage ?? 'fr'

  return (
    <Select
      aria-label={t('language.label')}
      value={current}
      onChange={(key) => {
        if (key) void i18n.changeLanguage(String(key))
      }}
      className={cn('w-12 shrink-0 sm:w-[4.75rem]', className)}
    >
      <Select.Trigger className="h-8 min-h-8 px-2.5 font-display text-sm">
        {/* Seul le code (textValue) est affiché dans le champ ; le nom complet est dans la liste */}
        <Select.Value>{({ selectedText }) => selectedText}</Select.Value>
        {/* Flèche masquée sur petit écran : l'en-tête mobile est très chargé */}
        <Select.Indicator className="hidden sm:block" />
      </Select.Trigger>
      <Select.Popover className="min-w-44">
        <ListBox>
          {supportedLanguages.map((lng) => (
            <ListBox.Item key={lng} id={lng} textValue={lng.toUpperCase()}>
              <span className="w-8 font-display">{lng.toUpperCase()}</span>
              {/* Chaque langue est nommée dans sa propre langue */}
              <span lang={lng}>{t(`language.${lng}`)}</span>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  )
}

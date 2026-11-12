import { ListBox, Select } from '@heroui/react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { type Currency, supportedCurrencies, useCurrency, XOF_PER_EUR } from '@/lib/currency'

/** Sélecteur de devise d'affichage (XOF / EUR / GNF). */
export function CurrencySwitcher({ className }: { className?: string }) {
  const { t, i18n } = useTranslation()
  const { currency, setCurrency, rates } = useCurrency()
  const decimal = new Intl.NumberFormat(i18n.resolvedLanguage === 'en' ? 'en-US' : 'fr-FR', {
    maximumFractionDigits: 3,
  })

  // Taux appliqué, affiché sous chaque devise
  const rateLabel = (code: Currency) => {
    if (code === 'EUR') return t('currency.rate.EUR', { value: decimal.format(XOF_PER_EUR) })
    if (code === 'GNF') return t('currency.rate.GNF', { value: decimal.format(rates.GNF) })
    return t('currency.rate.XOF')
  }

  return (
    <Select
      aria-label={t('currency.label')}
      value={currency}
      onChange={(key) => {
        if (key) setCurrency(String(key) as Currency)
      }}
      className={cn('w-14 shrink-0 sm:w-[5.25rem]', className)}
    >
      <Select.Trigger className="h-8 min-h-8 px-2.5 font-display text-sm">
        {/* Seul le code (textValue) est affiché dans le champ ; le nom complet est dans la liste */}
        <Select.Value>{({ selectedText }) => selectedText}</Select.Value>
        {/* Flèche masquée sur petit écran : l'en-tête mobile est très chargé */}
        <Select.Indicator className="hidden sm:block" />
      </Select.Trigger>
      <Select.Popover className="min-w-56">
        <ListBox>
          {supportedCurrencies.map((code) => (
            <ListBox.Item key={code} id={code} textValue={code}>
              <span className="w-10 self-start font-display">{code}</span>
              <span className="flex flex-col">
                <span>{t(`currency.names.${code}`)}</span>
                <span className="text-xs text-muted">{rateLabel(code)}</span>
              </span>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  )
}

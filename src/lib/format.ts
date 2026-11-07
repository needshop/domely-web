import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { convertAmount, useCurrency } from '@/lib/currency'

/** À partir de ce montant, affichage abrégé : 15 250 000 → « 15,25 M F CFA ». */
export const COMPACT_AMOUNT_THRESHOLD = 1_000_000

const localeOf = (lng: string | undefined) => (lng === 'en' ? 'en-US' : 'fr-FR')

/** Formateurs Intl alignés sur la langue et la devise actives. */
export function useFormatters() {
  const { i18n } = useTranslation()
  const { currency: currencyCode } = useCurrency()
  const locale = localeOf(i18n.resolvedLanguage)

  return useMemo(() => {
    const currency = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    })
    // Montants ≥ 1 M : abrégés, jusqu'à 2 décimales (15,25 M F CFA · 2,5 Md F CFA)
    const currencyMillions = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      notation: 'compact',
      maximumFractionDigits: 2,
    })
    // Graduations d'axe : abrégées dès le millier, 1 décimale max
    const currencyCompact = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      notation: 'compact',
      maximumFractionDigits: 1,
    })
    const formatAmount = (v: number) =>
      Math.abs(v) >= COMPACT_AMOUNT_THRESHOLD ? currencyMillions.format(v) : currency.format(v)
    const number = new Intl.NumberFormat(locale)
    const percent = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 })
    const signedPercent = new Intl.NumberFormat(locale, {
      style: 'percent',
      maximumFractionDigits: 0,
      signDisplay: 'exceptZero',
    })
    const monthShort = new Intl.DateTimeFormat(locale, { month: 'short' })
    const monthLong = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' })
    const dayMonth = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' })
    const dayMonthYear = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' })
    const fullDate = new Intl.DateTimeFormat(locale, { dateStyle: 'full' })

    return {
      locale,
      currencyCode,
      // — Montants issus des données (en devise de référence XOF) : convertis puis formatés —
      /** Convertit un montant XOF vers la devise d'affichage. */
      convert: (v: number) => convertAmount(v, currencyCode),
      /** Montant XOF converti et formaté : complet sous 1 M, abrégé au-delà. */
      money: (v: number) => formatAmount(convertAmount(v, currencyCode)),
      /** Montant XOF converti, exact (tableaux de données, lecteurs d'écran). */
      moneyExact: (v: number) => currency.format(convertAmount(v, currencyCode)),
      // — Montants déjà dans la devise d'affichage (ex. graphiques) —
      formatAmount,
      formatAmountExact: (v: number) => currency.format(v),
      /** Graduations d'axe (abrégées dès le millier). */
      formatAxis: (v: number) => currencyCompact.format(v),
      number: (v: number) => number.format(v),
      percent: (v: number) => percent.format(v),
      signedPercent: (v: number) => signedPercent.format(v),
      monthShort: (d: Date) => monthShort.format(d).replace('.', ''),
      monthLong: (d: Date) => monthLong.format(d),
      dayMonth: (d: Date) => dayMonth.format(d),
      dayMonthYear: (d: Date) => dayMonthYear.format(d),
      fullDate: (d: Date) => fullDate.format(d),
    }
  }, [locale, currencyCode])
}

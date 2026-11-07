import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

/** Pays proposés (codes ISO 3166-1) : zone UEMOA + Guinée. */
export const supportedCountries = ['SN', 'CI', 'TG', 'BJ', 'ML', 'BF', 'NE', 'GW', 'GN'] as const
export type CountryCode = (typeof supportedCountries)[number]

const displayNames = (locale: string) => new Intl.DisplayNames([locale], { type: 'region' })
const frNames = displayNames('fr')
const enNames = displayNames('en')

/** Noms du pays en français et en anglais (utile pour la recherche). */
export const countrySearchText = (code: string) =>
  `${frNames.of(code) ?? code} ${enNames.of(code) ?? code}`

/** Nom du pays dans la langue active. */
export function useCountryName() {
  const { i18n } = useTranslation()
  const lng = i18n.resolvedLanguage ?? 'fr'
  return useMemo(() => {
    const names = displayNames(lng)
    return (code: string) => names.of(code) ?? code
  }, [lng])
}

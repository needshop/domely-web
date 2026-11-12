import { type DialCountry, dialCodes } from '../constants'

export const dialCodeOf = (country: DialCountry) =>
  dialCodes.find((d) => d.country === country)?.code ?? ''

/**
 * Numéro au format international : indicatif + numéro national, sans espaces.
 * Le 0 initial d'un numéro français (06…) est retiré.
 */
export function toInternationalPhone(country: DialCountry, number: string) {
  const digits = number.replace(/\D/g, '')
  return `${dialCodeOf(country)}${country === 'FR' ? digits.replace(/^0/, '') : digits}`
}

/** Le numéro national compte 8 à 10 chiffres selon le pays (séparateurs tolérés). */
export const isValidNationalNumber = (number: string) =>
  /^[\d\s.-]+$/.test(number) && /^\d{8,10}$/.test(number.replace(/\D/g, ''))

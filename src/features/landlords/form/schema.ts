import type { TFunction } from 'i18next'
import { z } from 'zod'
import { supportedCountries } from '@/lib/countries'
import { type Landlord, landlordKinds } from '../types'

/** Pays de résidence proposés : zone UEMOA + Guinée, et la France (diaspora). */
export const residenceCountries = [...supportedCountries, 'FR'] as const

/** Chiffres d'un numéro de téléphone (sans espaces ni séparateurs). */
export const phoneDigits = (phone: string) => phone.replace(/\D/g, '')

/** Numéro plausible : « + » facultatif, chiffres, espaces, points ou tirets ; 8 à 15 chiffres. */
const isValidPhone = (phone: string) => {
  const digits = phoneDigits(phone).length
  return /^\+?[\d\s.-]+$/.test(phone) && digits >= 8 && digits <= 15
}

/**
 * Schéma du formulaire bailleur, messages traduits.
 * `others` : les autres bailleurs, pour signaler un numéro de téléphone déjà utilisé.
 */
export function makeLandlordSchema(t: TFunction, others: Landlord[]) {
  const required = t('form.errors.required')
  const optionalText = z.string().trim().max(120)

  return z
    .object({
      kind: z.enum(landlordKinds),
      name: z.string().trim().min(1, { error: required }).max(120),
      contactPerson: optionalText,
      phone: z
        .string()
        .trim()
        .min(1, { error: required })
        .refine(isValidPhone, { error: t('form.errors.invalidPhone') }),
      email: z
        .string()
        .trim()
        .min(1, { error: required })
        .pipe(z.email({ error: t('form.errors.invalidEmail') })),
      city: optionalText,
      country: z.enum(residenceCountries).nullable(),
      mandateStart: z.string(),
      feeRate: z
        .number()
        .min(0, { error: t('landlords.form.errors.feeRate') })
        .max(100, { error: t('landlords.form.errors.feeRate') })
        .nullable(),
      notes: z.string().trim().max(1000),
    })
    .superRefine((v, ctx) => {
      const duplicate = others.find((o) => phoneDigits(o.phone) === phoneDigits(v.phone))
      if (v.phone && duplicate) {
        ctx.addIssue({
          code: 'custom',
          path: ['phone'],
          message: t('landlords.form.errors.duplicatePhone', { name: duplicate.name }),
        })
      }
    })
}

export type LandlordFormValues = z.input<ReturnType<typeof makeLandlordSchema>>

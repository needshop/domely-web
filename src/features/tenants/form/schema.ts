import type { TFunction } from 'i18next'
import { z } from 'zod'
import {
  emergencyRelations,
  type IdDocumentType,
  idDocumentTypes,
  type Tenant,
  type TenantKind,
  tenantKinds,
} from '../types'

/** Pièces d'identité proposées selon le type de locataire. */
export const idDocumentsByKind: Record<TenantKind, readonly IdDocumentType[]> = {
  individual: ['nationalId', 'passport', 'residencePermit'],
  company: ['companyRegistration'],
}

/** Chiffres d'un numéro de téléphone (sans espaces ni séparateurs). */
export const phoneDigits = (phone: string) => phone.replace(/\D/g, '')

/** Numéro plausible : « + » facultatif, chiffres, espaces, points ou tirets ; 8 à 15 chiffres. */
const isValidPhone = (phone: string) => {
  const digits = phoneDigits(phone).length
  return /^\+?[\d\s.-]+$/.test(phone) && digits >= 8 && digits <= 15
}

/**
 * Schéma de validation du formulaire locataire, messages traduits.
 * `others` : les autres locataires, pour signaler un numéro de téléphone déjà utilisé.
 */
export function makeTenantSchema(t: TFunction, others: Tenant[]) {
  const required = t('form.errors.required')
  const invalidPhone = t('form.errors.invalidPhone')
  const optionalText = z.string().trim().max(120)

  return z
    .object({
      kind: z.enum(tenantKinds),
      name: z.string().trim().min(1, { error: required }).max(120),
      occupation: optionalText,
      contactPerson: optionalText,
      phone: z
        .string()
        .trim()
        .min(1, { error: required })
        .refine(isValidPhone, { error: invalidPhone }),
      email: z.union([z.literal(''), z.email({ error: t('form.errors.invalidEmail') })]),
      idType: z.enum(idDocumentTypes).nullable(),
      idNumber: z.string().trim().max(40),
      emergencyName: optionalText,
      emergencyPhone: z.string().trim(),
      emergencyRelation: z.enum(emergencyRelations).nullable(),
      notes: z.string().trim().max(1000),
    })
    .superRefine((v, ctx) => {
      const issue = (path: string, message = required) =>
        ctx.addIssue({ code: 'custom', path: [path], message })

      // Numéro déjà attribué à un autre locataire
      const duplicate = others.find((o) => phoneDigits(o.phone) === phoneDigits(v.phone))
      if (v.phone && duplicate) {
        issue('phone', t('tenants.form.errors.duplicatePhone', { name: duplicate.name }))
      }

      // Pièce d'identité : type et numéro vont ensemble
      if (v.idType && !v.idNumber) issue('idNumber')
      if (v.idNumber && !v.idType) issue('idType')

      // Personne à prévenir (particulier) : nom et téléphone vont ensemble
      if (v.kind === 'individual') {
        const hasContact = v.emergencyName || v.emergencyPhone || v.emergencyRelation
        if (hasContact && !v.emergencyName) issue('emergencyName')
        if (hasContact && !v.emergencyPhone) issue('emergencyPhone')
        if (v.emergencyPhone && !isValidPhone(v.emergencyPhone)) {
          issue('emergencyPhone', invalidPhone)
        }
      }
    })
}

export type TenantFormValues = z.input<ReturnType<typeof makeTenantSchema>>

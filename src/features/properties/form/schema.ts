import type { TFunction } from 'i18next'
import { z } from 'zod'
import { supportedCountries } from '@/lib/countries'
import { propertyTypes, type PropertyType, type UnitKind } from '../types'

export const unitKinds = [
  'apartment',
  'studio',
  'house',
  'shop',
  'office',
] as const satisfies readonly UnitKind[]

/** Types de biens composés d'un seul lot. */
export const singleUnitTypes: readonly PropertyType[] = ['apartment', 'house']
export const isSingleUnitType = (type: PropertyType) => singleUnitTypes.includes(type)

/** Nature de lot proposée par défaut selon le type de bien. */
export const defaultUnitKind: Record<PropertyType, UnitKind> = {
  building: 'apartment',
  residence: 'apartment',
  apartment: 'apartment',
  house: 'house',
  commercial: 'shop',
  office: 'office',
}

/** Schéma de validation du formulaire, messages traduits. */
export function makePropertySchema(t: TFunction) {
  const required = t('properties.form.errors.required')
  const positive = t('properties.form.errors.positive')
  const min0 = t('properties.form.errors.min0')

  const requiredNumber = z
    .number({ error: required })
    .nullable()
    .refine((v) => v !== null && !Number.isNaN(v), { error: required })

  const unit = z.object({
    id: z.string().optional(),
    label: z.string().trim().min(1, { error: required }).max(60),
    kind: z.enum(unitKinds),
    floor: z.number().int().nullable(),
    area: requiredNumber.refine((v) => v === null || v > 0, { error: positive }),
    rooms: z.number().int().min(1, { error: positive }).nullable(),
    rent: requiredNumber.refine((v) => v === null || v >= 0, { error: min0 }),
    charges: z.number().min(0, { error: min0 }).nullable(),
    status: z.enum(['rented', 'vacant', 'underWorks']),
    /** Locataire en place (lecture seule : géré par le module Locataires) */
    tenantName: z.string().optional(),
  })

  return z
    .object({
      name: z.string().trim().min(1, { error: required }).max(120),
      type: z.enum(propertyTypes, { error: required }),
      description: z.string().trim().max(1000),
      address: z.object({
        street: z.string().trim().min(1, { error: required }),
        district: z.string().trim(),
        city: z.string().trim().min(1, { error: required }),
        country: z.enum(supportedCountries, { error: required }),
      }),
      acquiredAt: z.string(),
      units: z.array(unit).min(1, { error: t('properties.form.errors.atLeastOneUnit') }),
    })
    .superRefine((values, ctx) => {
      if (isSingleUnitType(values.type) && values.units.length > 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['units'],
          message: t('properties.form.errors.singleUnit', {
            type: t(`properties.type.${values.type}`),
          }),
        })
      }
      // Libellés de lots uniques
      const seen = new Map<string, number>()
      values.units.forEach((u, i) => {
        const key = u.label.trim().toLowerCase()
        if (!key) return
        if (seen.has(key)) {
          ctx.addIssue({
            code: 'custom',
            path: ['units', i, 'label'],
            message: t('properties.form.errors.duplicateLabel'),
          })
        } else seen.set(key, i)
      })
    })
}

export type PropertyFormValues = z.input<ReturnType<typeof makePropertySchema>>
export type UnitFormValues = PropertyFormValues['units'][number]

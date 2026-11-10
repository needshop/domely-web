import type { TFunction } from 'i18next'
import { z } from 'zod'
import type { Property } from '@/features/properties/types'
import { type Lease, leaseTypes } from '../types'
import { effectiveEnd, leaseStatus, periodsOverlap } from '../utils'

interface SchemaContext {
  /** Autres contrats (contrôle des chevauchements sur un même lot) */
  others: Lease[]
  properties: Property[]
  /** Formats de date pour les messages */
  formatDate: (iso: string) => string
}

/** Schéma de validation du formulaire de contrat, messages traduits. */
export function makeLeaseSchema(t: TFunction, { others, properties, formatDate }: SchemaContext) {
  const required = t('form.errors.required')
  const min0 = t('properties.form.errors.min0')

  const requiredNumber = z
    .number({ error: required })
    .nullable()
    .refine((v) => v !== null && !Number.isNaN(v), { error: required })

  return z
    .object({
      tenantId: z.string().nullable(),
      propertyId: z.string().nullable(),
      unitId: z.string().nullable(),
      type: z.enum(leaseTypes),
      startDate: z.string().min(1, { error: required }),
      endDate: z.string().min(1, { error: required }),
      rent: requiredNumber.refine((v) => v === null || v > 0, {
        error: t('properties.form.errors.positive'),
      }),
      charges: z.number().min(0, { error: min0 }).nullable(),
      deposit: z.number().min(0, { error: min0 }).nullable(),
      paymentDay: requiredNumber.refine((v) => v === null || (v >= 1 && v <= 28), {
        error: t('contracts.form.errors.paymentDay'),
      }),
      tacitRenewal: z.boolean(),
      notes: z.string().trim().max(1000),
    })
    .superRefine((v, ctx) => {
      const issue = (path: string, message = required) =>
        ctx.addIssue({ code: 'custom', path: [path], message })

      if (!v.tenantId) issue('tenantId')
      if (!v.propertyId) issue('propertyId')
      if (!v.unitId) issue('unitId')

      if (v.startDate && v.endDate && v.endDate <= v.startDate) {
        issue('endDate', t('contracts.form.errors.endBeforeStart'))
      }

      if (!v.propertyId || !v.unitId || !v.startDate || !v.endDate) return

      const unit = properties
        .find((p) => p.id === v.propertyId)
        ?.units.find((u) => u.id === v.unitId)
      if (unit?.status === 'underWorks') issue('unitId', t('contracts.form.errors.underWorks'))

      // Un lot ne peut avoir qu'un contrat à la fois
      const conflict = others.find(
        (o) =>
          o.propertyId === v.propertyId &&
          o.unitId === v.unitId &&
          leaseStatus(o) !== 'terminated' &&
          periodsOverlap(v.startDate, v.endDate, o.startDate, effectiveEnd(o)),
      )
      if (conflict) {
        issue(
          'startDate',
          t('contracts.form.errors.overlap', {
            reference: conflict.reference,
            start: formatDate(conflict.startDate),
            end: formatDate(effectiveEnd(conflict)),
          }),
        )
      }
    })
}

export type LeaseFormValues = z.input<ReturnType<typeof makeLeaseSchema>>

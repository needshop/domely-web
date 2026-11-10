import type { TFunction } from 'i18next'
import { z } from 'zod'
import { costBearers, maintenanceCategories, maintenancePriorities, reporterKinds } from '../types'

/** Valeur du sélecteur de lot pour les parties communes. */
export const COMMON_AREAS = '__common'

/** Schéma de validation du formulaire d'intervention, messages traduits. */
export function makeInterventionSchema(t: TFunction) {
  const required = t('form.errors.required')
  return z
    .object({
      propertyId: z.string().nullable(),
      /** Lot, ou COMMON_AREAS pour les parties communes */
      unitId: z.string().nullable(),
      title: z.string().trim().min(1, { error: required }).max(120),
      category: z.enum(maintenanceCategories),
      priority: z.enum(maintenancePriorities),
      description: z.string().trim().max(1000),
      reportedBy: z.enum(reporterKinds),
      reportedAt: z.string().min(1, { error: required }),
      scheduledAt: z.string(),
      providerName: z.string().trim().max(120),
      providerPhone: z.string().trim().max(30),
      estimatedCost: z
        .number()
        .min(0, { error: t('properties.form.errors.min0') })
        .nullable(),
      chargedTo: z.enum(costBearers),
    })
    .superRefine((v, ctx) => {
      const issue = (path: string, message = required) =>
        ctx.addIssue({ code: 'custom', path: [path], message })
      if (!v.propertyId) issue('propertyId')
      if (!v.unitId) issue('unitId')
      if (v.scheduledAt && v.reportedAt && v.scheduledAt < v.reportedAt) {
        issue('scheduledAt', t('maintenance.actions.errors.beforeReport'))
      }
      if (v.providerPhone && !v.providerName) issue('providerName')
    })
}

export type InterventionFormValues = z.input<ReturnType<typeof makeInterventionSchema>>

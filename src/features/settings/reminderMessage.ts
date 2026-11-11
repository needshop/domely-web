import type { Organization } from './types'

/** Variables utilisables dans un modèle de relance. */
export const reminderVariables = ['name', 'month', 'unit', 'property', 'amount', 'date'] as const
export type ReminderVariable = (typeof reminderVariables)[number]

/** Remplace les variables {{nom}} d'un modèle personnalisé (une variable inconnue reste telle quelle). */
export const fillTemplate = (template: string, values: Record<ReminderVariable, string>) =>
  template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) =>
    key in values ? values[key as ReminderVariable] : match,
  )

/** Signature ajoutée aux relances : nom de l'organisation et coordonnées, si renseignés. */
export function signature(org: Organization) {
  const contact = [org.phone, org.email].filter(Boolean).join(' · ')
  return [org.name, contact].filter(Boolean).join('\n')
}

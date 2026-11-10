import type { Property, Unit } from '@/features/properties/types'
import type { Tenant } from '@/features/tenants/types'

export const maintenanceCategories = [
  'plumbing',
  'electricity',
  'airConditioning',
  'locksmith',
  'painting',
  'masonry',
  'appliances',
  'cleaning',
  'other',
] as const
export type MaintenanceCategory = (typeof maintenanceCategories)[number]

export const maintenancePriorities = ['urgent', 'normal', 'low'] as const
export type MaintenancePriority = (typeof maintenancePriorities)[number]

/**
 * Cycle de vie : nouvelle → planifiée → en cours → terminée ; annulable tant qu'elle n'est
 * pas terminée ; une intervention terminée ou annulée peut être rouverte.
 */
export const maintenanceStatuses = ['new', 'scheduled', 'inProgress', 'done', 'cancelled'] as const
export type MaintenanceStatus = (typeof maintenanceStatuses)[number]

/** Interventions encore à traiter. */
export const openStatuses: readonly MaintenanceStatus[] = ['new', 'scheduled', 'inProgress']

/** Qui a signalé le problème. */
export const reporterKinds = ['tenant', 'owner', 'manager'] as const
export type ReporterKind = (typeof reporterKinds)[number]

/** Qui supporte le coût de l'intervention. */
export const costBearers = ['owner', 'tenant'] as const
export type CostBearer = (typeof costBearers)[number]

/** Étape de l'historique d'une intervention. */
export interface MaintenanceEvent {
  /** Date de l'étape (ISO) */
  date: string
  status: MaintenanceStatus
  note?: string
}

export interface Provider {
  name: string
  phone?: string
}

export interface Intervention {
  id: string
  /** Référence lisible, ex. INT-2026-0012 */
  reference: string
  propertyId: string
  /** Lot concerné ; absent = parties communes */
  unitId?: string
  title: string
  description?: string
  category: MaintenanceCategory
  priority: MaintenancePriority
  status: MaintenanceStatus
  reportedBy: ReporterKind
  /** Locataire ayant signalé (si reportedBy = tenant) */
  tenantId?: string
  /** Date du signalement (ISO) */
  reportedAt: string
  /** Date prévue de passage (ISO) */
  scheduledAt?: string
  /** Date de fin des travaux (ISO) */
  completedAt?: string
  provider?: Provider
  /** Coût estimé (XOF) */
  estimatedCost?: number
  /** Coût réel (XOF) */
  actualCost?: number
  chargedTo: CostBearer
  history: MaintenanceEvent[]
}

/** Intervention enrichie du bien, du lot et du locataire. */
export interface InterventionRow {
  intervention: Intervention
  property?: Property
  unit?: Unit
  tenant?: Tenant
}

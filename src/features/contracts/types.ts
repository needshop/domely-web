import type { Property, Unit } from '@/features/properties/types'
import type { Tenant } from '@/features/tenants/types'

/** Nature du bail : habitation, commercial (boutique) ou professionnel (bureau). */
export const leaseTypes = ['residential', 'commercial', 'professional'] as const
export type LeaseType = (typeof leaseTypes)[number]

export const terminationReasons = [
  'tenantLeave',
  'ownerTermination',
  'unpaidRent',
  'mutualAgreement',
  'notRenewed',
  'other',
] as const
export type TerminationReason = (typeof terminationReasons)[number]

/** Contrat de bail : un locataire, un lot, des conditions financières et une période. */
export interface Lease {
  id: string
  /** Référence lisible, ex. BAIL-2025-0012 */
  reference: string
  propertyId: string
  unitId: string
  tenantId: string
  type: LeaseType
  /** Début du bail (ISO) */
  startDate: string
  /** Fin du bail (ISO) */
  endDate: string
  /** Loyer mensuel hors charges (XOF) */
  rent: number
  /** Charges mensuelles (XOF) */
  charges: number
  /** Dépôt de garantie (XOF) */
  deposit: number
  /** Jour d'échéance du loyer dans le mois (1–28) */
  paymentDay: number
  /** Reconduction tacite à l'échéance */
  tacitRenewal: boolean
  /** Date d'effet de la résiliation (ISO) */
  terminatedAt?: string
  terminationReason?: TerminationReason
  notes?: string
  /** Date de création dans Domely (ISO) */
  createdAt: string
}

/**
 * Situation du contrat :
 * - upcoming : signé, pas encore commencé
 * - active : en cours
 * - expired : échéance dépassée sans résiliation (à renouveler ; le locataire occupe toujours le lot)
 * - terminated : résilié (date d'effet passée)
 */
export type LeaseStatus = 'upcoming' | 'active' | 'expired' | 'terminated'

/** Contrat enrichi du bien, du lot, du locataire et de sa situation. */
export interface LeaseRow {
  lease: Lease
  status: LeaseStatus
  property?: Property
  unit?: Unit
  tenant?: Tenant
}

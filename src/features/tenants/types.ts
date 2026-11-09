import type { Property, Unit, UnitLease } from '@/features/properties/types'

export const tenantKinds = ['individual', 'company'] as const
export type TenantKind = (typeof tenantKinds)[number]

export const idDocumentTypes = [
  'nationalId',
  'passport',
  'residencePermit',
  'companyRegistration',
] as const
export type IdDocumentType = (typeof idDocumentTypes)[number]

export const emergencyRelations = [
  'spouse',
  'parent',
  'sibling',
  'child',
  'friend',
  'other',
] as const
export type EmergencyRelation = (typeof emergencyRelations)[number]

export interface Tenant {
  id: string
  kind: TenantKind
  /** Nom complet (particulier) ou raison sociale (société) */
  name: string
  phone: string
  email?: string
  /** Profession (particulier) ou secteur d'activité (société) */
  occupation?: string
  /** Interlocuteur au sein de la société */
  contactPerson?: string
  idDocument?: { type: IdDocumentType; number: string }
  /** Personne à prévenir (particulier) */
  emergencyContact?: { name: string; phone: string; relation: EmergencyRelation }
  /** Date d'ajout dans Domely (ISO) */
  createdAt: string
  notes?: string
}

/** Bail d'un locataire, avec le lot et le bien concernés. */
export interface TenantLease {
  property: Property
  unit: Unit
  lease: UnitLease
}

/**
 * Situation du locataire : « late » (au moins un loyer en retard), « active » (bail en cours,
 * à jour), « inactive » (aucun bail en cours).
 */
export type TenantStatus = 'active' | 'late' | 'inactive'

/** Locataire enrichi de ses baux et indicateurs calculés. */
export interface TenantRow {
  tenant: Tenant
  leases: TenantLease[]
  status: TenantStatus
  /** Loyers + charges mensuels de tous ses lots (XOF) */
  monthlyDue: number
  /** Fin de bail la plus proche (ISO) */
  nextLeaseEnd?: string
}

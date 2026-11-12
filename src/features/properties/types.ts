/** Types de biens gérés (les terrains ne sont pas pris en charge). */
export const propertyTypes = [
  'building',
  'residence',
  'apartment',
  'house',
  'commercial',
  'office',
] as const
export type PropertyType = (typeof propertyTypes)[number]

export type UnitKind = 'apartment' | 'studio' | 'house' | 'shop' | 'office'
export type UnitStatus = 'rented' | 'vacant' | 'underWorks'

/**
 * Bail en cours sur un lot, déduit des contrats (module Contrats) ;
 * le locataire est décrit dans le module Locataires.
 */
export interface UnitLease {
  /** Identifiant du contrat */
  id: string
  tenantId: string
  /** Début du bail (ISO) */
  startDate: string
  /** Fin du bail (ISO) */
  endDate: string
}

/** Lot : unité louable d'un bien (appartement, boutique, bureau…). */
export interface Unit {
  id: string
  label: string
  kind: UnitKind
  floor?: number
  /** Surface en m² */
  area: number
  rooms?: number
  /** Loyer mensuel hors charges (XOF) : celui du bail si le lot est loué, sinon le loyer de référence */
  rent: number
  /** Charges mensuelles (XOF) : celles du bail si le lot est loué */
  charges: number
  status: UnitStatus
  lease?: UnitLease
  /** Loyer en retard */
  isLate?: boolean
}

export interface Address {
  street: string
  district: string
  city: string
  /** Code pays ISO 3166-1 (ex. SN, CI) */
  country: string
}

export interface Property {
  id: string
  name: string
  type: PropertyType
  address: Address
  /** Date d'acquisition (ISO) */
  acquiredAt?: string
  /** Date d'ajout dans Domely (ISO) */
  createdAt: string
  description?: string
  /** Bailleur qui a confié le bien à l'agence (comptes professionnels, module Bailleurs) */
  landlordId?: string
  units: Unit[]
}

/** Indicateurs calculés d'un bien. */
export interface PropertyStats {
  units: number
  rented: number
  vacant: number
  underWorks: number
  occupancyRate: number
  /** Loyers mensuels des lots loués (XOF, hors charges) */
  monthlyRent: number
  /** Loyers mensuels si tous les lots étaient loués (XOF) */
  potentialRent: number
  lateCount: number
  totalArea: number
}

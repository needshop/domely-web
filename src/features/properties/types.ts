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

export interface UnitTenant {
  name: string
  /** Fin de bail (ISO) */
  leaseEnd: string
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
  /** Loyer mensuel hors charges (XOF) */
  rent: number
  /** Charges mensuelles (XOF) */
  charges: number
  status: UnitStatus
  tenant?: UnitTenant
  /** Loyer en retard */
  isLate?: boolean
}

export interface Address {
  street: string
  district: string
  city: string
  country: string
}

export interface Property {
  id: string
  name: string
  type: PropertyType
  address: Address
  /** Date d'acquisition (ISO) */
  acquiredAt: string
  /** Date d'ajout dans Domely (ISO) */
  createdAt: string
  description?: string
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

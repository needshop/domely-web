import type { Property } from '@/features/properties/types'

export const landlordKinds = ['individual', 'company'] as const
export type LandlordKind = (typeof landlordKinds)[number]

/**
 * Bailleur : propriétaire qui confie la gestion de ses biens à l'agence (compte professionnel).
 * Les biens le désignent par `Property.landlordId`.
 */
export interface Landlord {
  id: string
  kind: LandlordKind
  /** Nom complet (particulier) ou raison sociale (société, SCI…) */
  name: string
  /** Interlocuteur au sein de la société */
  contactPerson?: string
  phone: string
  /** Obligatoire : comptes rendus de gestion et échanges avec l'agence */
  email: string
  /** Ville et pays de résidence (code ISO) : souvent à l'étranger pour la diaspora */
  city?: string
  country?: string
  /** Début du mandat de gestion (ISO) */
  mandateStart?: string
  /** Honoraires de gestion, en % des loyers encaissés */
  feeRate?: number
  notes?: string
  /** Date d'ajout dans Domely (ISO) */
  createdAt: string
}

/** Bailleur enrichi de ses biens et indicateurs calculés. */
export interface LandlordRow {
  landlord: Landlord
  properties: Property[]
  units: number
  rented: number
  occupancyRate: number
  /** Loyers mensuels des lots loués (XOF, hors charges) */
  monthlyRent: number
  /** Honoraires de gestion mensuels estimés (XOF) */
  monthlyFees: number
  lateCount: number
}

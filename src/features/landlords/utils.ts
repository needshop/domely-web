import type { Property } from '@/features/properties/types'
import { portfolioStats } from '@/features/properties/utils'
import type { Landlord, LandlordRow } from './types'

/** Honoraires mensuels estimés : taux de gestion appliqué aux loyers des lots loués. */
export const monthlyFees = (monthlyRent: number, feeRate: number | undefined) =>
  Math.round((monthlyRent * (feeRate ?? 0)) / 100)

/** Bailleurs avec leurs biens (désignés par `Property.landlordId`) et leurs indicateurs. */
export function landlordRows(landlords: Landlord[], properties: Property[]): LandlordRow[] {
  return landlords.map((landlord) => {
    const owned = properties.filter((p) => p.landlordId === landlord.id)
    const stats = portfolioStats(owned)
    return {
      landlord,
      properties: owned,
      units: stats.units,
      rented: stats.rented,
      occupancyRate: stats.occupancyRate,
      monthlyRent: stats.monthlyRent,
      monthlyFees: monthlyFees(stats.monthlyRent, landlord.feeRate),
      lateCount: stats.lateCount,
    }
  })
}

/** Indicateurs de la page Bailleurs. */
export function landlordsSummary(rows: LandlordRow[], properties: Property[]) {
  const managed = rows.reduce((s, r) => s + r.properties.length, 0)
  return {
    total: rows.length,
    withoutProperty: rows.filter((r) => r.properties.length === 0).length,
    properties: managed,
    unassigned: properties.filter((p) => !p.landlordId).length,
    monthlyRent: rows.reduce((s, r) => s + r.monthlyRent, 0),
    monthlyFees: rows.reduce((s, r) => s + r.monthlyFees, 0),
  }
}

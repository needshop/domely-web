import type { Property, UnitKind } from '@/features/properties/types'
import { daysUntil, todayIso } from '@/lib/dates'
import type { Lease, LeaseRow, LeaseStatus, LeaseType } from './types'

/** Nature de bail correspondant à un lot. */
export const leaseTypeForUnit = (kind: UnitKind): LeaseType =>
  kind === 'shop' ? 'commercial' : kind === 'office' ? 'professional' : 'residential'

/** Nombre de jours avant une fin de bail pour la signaler. */
export const LEASE_ENDING_DAYS = 90

/** Bail se terminant dans les {@link LEASE_ENDING_DAYS} prochains jours. */
export const isLeaseEndingSoon = (endDate: string) => {
  const days = daysUntil(endDate)
  return days >= 0 && days <= LEASE_ENDING_DAYS
}

export function leaseStatus(lease: Lease, today = todayIso()): LeaseStatus {
  if (lease.terminatedAt && lease.terminatedAt <= today) return 'terminated'
  if (lease.startDate > today) return 'upcoming'
  if (lease.endDate < today) return 'expired'
  return 'active'
}

/** Le contrat occupe le lot : en cours, ou échu sans résiliation (locataire toujours en place). */
export const isOccupying = (status: LeaseStatus) => status === 'active' || status === 'expired'

/** Fin effective d'un contrat : date de résiliation si elle est antérieure à l'échéance. */
export const effectiveEnd = (lease: Lease) =>
  lease.terminatedAt && lease.terminatedAt < lease.endDate ? lease.terminatedAt : lease.endDate

/** Les deux périodes se chevauchent-elles ? (dates incluses) */
export const periodsOverlap = (aStart: string, aEnd: string, bStart: string, bEnd: string) =>
  aStart <= bEnd && bStart <= aEnd

/**
 * Applique les contrats aux biens : un lot est « loué » s'il a un contrat en cours,
 * avec le loyer, les charges et le locataire de ce contrat.
 */
export function applyLeases(properties: Property[], leases: Lease[]): Property[] {
  const today = todayIso()
  const occupying = new Map<string, Lease>()
  for (const lease of leases) {
    if (isOccupying(leaseStatus(lease, today))) {
      occupying.set(`${lease.propertyId}/${lease.unitId}`, lease)
    }
  }

  return properties.map((property) => ({
    ...property,
    units: property.units.map((unit) => {
      const lease = occupying.get(`${property.id}/${unit.id}`)
      if (!lease) {
        return {
          ...unit,
          status: unit.status === 'rented' ? 'vacant' : unit.status,
          lease: undefined,
          isLate: undefined,
        }
      }
      return {
        ...unit,
        status: 'rented',
        rent: lease.rent,
        charges: lease.charges,
        lease: {
          id: lease.id,
          tenantId: lease.tenantId,
          startDate: lease.startDate,
          endDate: lease.endDate,
        },
        isLate: lease.isLate,
      }
    }),
  }))
}

/** Prochaine référence de contrat pour une année : BAIL-AAAA-NNNN. */
export function nextReference(leases: Lease[], year: string) {
  const max = leases.reduce((m, l) => {
    const match = /^BAIL-(\d{4})-(\d+)$/.exec(l.reference)
    return match && match[1] === year ? Math.max(m, Number(match[2])) : m
  }, 0)
  return `BAIL-${year}-${String(max + 1).padStart(4, '0')}`
}

/** Indicateurs agrégés des contrats. */
export function leasesSummary(rows: LeaseRow[]) {
  const running = rows.filter((r) => isOccupying(r.status))
  return {
    active: running.length,
    upcoming: rows.filter((r) => r.status === 'upcoming').length,
    expired: rows.filter((r) => r.status === 'expired').length,
    endingSoon: rows.filter((r) => r.status === 'active' && isLeaseEndingSoon(r.lease.endDate))
      .length,
    monthlyRent: running.reduce((s, r) => s + r.lease.rent + r.lease.charges, 0),
    deposits: running.reduce((s, r) => s + r.lease.deposit, 0),
  }
}

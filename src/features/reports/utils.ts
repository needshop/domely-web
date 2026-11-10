import type { MonthlyCollection } from '@/components/charts/RentCollectionChart'
import type { Intervention, MaintenanceCategory } from '@/features/maintenance/types'
import { propertyStats } from '@/features/properties/utils'
import type { Property } from '@/features/properties/types'
import type { RentDueRow } from '@/features/rents/types'
import { isOverdue, periodsBetween, shiftPeriod } from '@/features/rents/utils'
import { todayIso } from '@/lib/dates'

/** Période d'analyse : 12 derniers mois glissants, ou une année civile (« 2026 »). */
export type ReportPeriod = '12m' | string

export interface PeriodRange {
  /** Mois couverts (AAAA-MM), sans dépasser le mois courant */
  months: string[]
  /** Premier jour couvert (ISO) */
  from: string
  /** Dernier jour couvert (ISO) : fin de période ou aujourd'hui */
  to: string
}

export function periodRange(period: ReportPeriod, today = todayIso()): PeriodRange {
  const thisMonth = today.slice(0, 7)
  const months =
    period === '12m'
      ? periodsBetween(shiftPeriod(thisMonth, -11), thisMonth)
      : periodsBetween(`${period}-01`, [`${period}-12`, thisMonth].sort()[0])
  const last = months[months.length - 1]
  const [y, m] = last.split('-').map(Number)
  const endOfMonth = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10)
  return { months, from: `${months[0]}-01`, to: [endOfMonth, today].sort()[0] }
}

/** Intervention terminée dans la période. */
const doneIn = (i: Intervention, range: PeriodRange) =>
  i.status === 'done' && !!i.completedAt && i.completedAt >= range.from && i.completedAt <= range.to

/** Coût supporté par le propriétaire (les frais refacturés au locataire ne comptent pas). */
const ownerCost = (i: Intervention) => (i.chargedTo === 'owner' ? (i.actualCost ?? 0) : 0)

/** Attendu et encaissé par mois (échéances des mois de la période). */
export function monthlyCollections(dues: RentDueRow[], range: PeriodRange): MonthlyCollection[] {
  return range.months.map((month) => {
    const inMonth = dues.filter((r) => r.due.period === month)
    return {
      month: `${month}-01`,
      expected: inMonth.reduce((s, r) => s + r.due.amount, 0),
      collected: inMonth.reduce((s, r) => s + r.due.paid, 0),
    }
  })
}

export interface PropertyPerformance {
  property: Property
  units: number
  /** Taux d'occupation actuel */
  occupancyRate: number
  expected: number
  collected: number
  rate: number
  /** Impayés des mois de la période */
  overdue: number
  /** Dépenses d'entretien à la charge du propriétaire */
  expenses: number
  /** Encaissé − dépenses */
  net: number
}

/** Performance de chaque bien sur la période, du meilleur résultat net au moins bon. */
export function propertyPerformance(
  properties: Property[],
  dues: RentDueRow[],
  interventions: Intervention[],
  range: PeriodRange,
): PropertyPerformance[] {
  const months = new Set(range.months)
  return properties
    .map((property) => {
      const own = dues.filter((r) => r.lease.propertyId === property.id && months.has(r.due.period))
      const expected = own.reduce((s, r) => s + r.due.amount, 0)
      const collected = own.reduce((s, r) => s + r.due.paid, 0)
      const expenses = interventions
        .filter((i) => i.propertyId === property.id && doneIn(i, range))
        .reduce((s, i) => s + ownerCost(i), 0)
      const stats = propertyStats(property)
      return {
        property,
        units: stats.units,
        occupancyRate: stats.occupancyRate,
        expected,
        collected,
        rate: expected ? collected / expected : 0,
        overdue: own.filter((r) => isOverdue(r.due)).reduce((s, r) => s + r.due.remaining, 0),
        expenses,
        net: collected - expenses,
      }
    })
    .sort((a, b) => b.net - a.net)
}

/** Totaux d'une liste de performances. */
export function performanceTotals(rows: PropertyPerformance[]) {
  const sum = (key: 'expected' | 'collected' | 'overdue' | 'expenses' | 'net') =>
    rows.reduce((s, r) => s + r[key], 0)
  const expected = sum('expected')
  const collected = sum('collected')
  return {
    expected,
    collected,
    rate: expected ? collected / expected : 0,
    overdue: sum('overdue'),
    expenses: sum('expenses'),
    net: sum('net'),
  }
}

export const agingBuckets = ['1-30', '31-60', '61-90', '90+'] as const
export type AgingBucket = (typeof agingBuckets)[number]

const bucketOf = (days: number): AgingBucket =>
  days <= 30 ? '1-30' : days <= 60 ? '31-60' : days <= 90 ? '61-90' : '90+'

/** Impayés à date, par ancienneté du retard. */
export function agingReport(dues: RentDueRow[]) {
  const overdue = dues.filter((r) => isOverdue(r.due))
  return agingBuckets.map((bucket) => {
    const inBucket = overdue.filter((r) => bucketOf(r.due.daysLate) === bucket)
    return {
      bucket,
      count: inBucket.length,
      amount: inBucket.reduce((s, r) => s + r.due.remaining, 0),
    }
  })
}

export interface Debtor {
  tenantId: string
  name: string
  location: string
  amount: number
  count: number
  /** Retard de l'échéance impayée la plus ancienne (jours) */
  oldestDays: number
  leaseId: string
}

/** Locataires qui doivent le plus, à date. */
export function topDebtors(dues: RentDueRow[], limit = 5): Debtor[] {
  const byTenant = new Map<string, Debtor>()
  for (const r of dues) {
    if (!isOverdue(r.due)) continue
    const current = byTenant.get(r.lease.tenantId)
    byTenant.set(r.lease.tenantId, {
      tenantId: r.lease.tenantId,
      name: r.tenant?.name ?? '—',
      location: `${r.property?.name ?? '—'} · ${r.unit?.label ?? '—'}`,
      amount: (current?.amount ?? 0) + r.due.remaining,
      count: (current?.count ?? 0) + 1,
      oldestDays: Math.max(current?.oldestDays ?? 0, r.due.daysLate),
      leaseId: current?.leaseId ?? r.lease.id,
    })
  }
  return [...byTenant.values()].sort((a, b) => b.amount - a.amount).slice(0, limit)
}

/** Dépenses d'entretien de la période par catégorie, de la plus coûteuse à la moins coûteuse. */
export function expensesByCategory(interventions: Intervention[], range: PeriodRange) {
  const done = interventions.filter((i) => doneIn(i, range))
  const byCategory = new Map<MaintenanceCategory, { amount: number; count: number }>()
  for (const i of done) {
    const current = byCategory.get(i.category) ?? { amount: 0, count: 0 }
    byCategory.set(i.category, {
      amount: current.amount + (i.actualCost ?? 0),
      count: current.count + 1,
    })
  }
  return {
    categories: [...byCategory]
      .map(([category, v]) => ({ category, ...v }))
      .sort((a, b) => b.amount - a.amount),
    owner: done.reduce((s, i) => s + ownerCost(i), 0),
    tenant: done.reduce((s, i) => s + (i.chargedTo === 'tenant' ? (i.actualCost ?? 0) : 0), 0),
    count: done.length,
  }
}

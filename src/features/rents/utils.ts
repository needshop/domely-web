import type { Lease } from '@/features/contracts/types'
import { effectiveEnd, leaseStatus } from '@/features/contracts/utils'
import { daysUntil, todayIso } from '@/lib/dates'
import type { Payment, RentDue, RentDueRow, RentStatus } from './types'

/** Mois courant (AAAA-MM). */
export const currentPeriod = () => todayIso().slice(0, 7)

/** Mois décalé de n (AAAA-MM). */
export function shiftPeriod(period: string, months: number) {
  const [y, m] = period.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + months, 1))
  return d.toISOString().slice(0, 7)
}

/** Mois de `from` à `to` inclus (AAAA-MM). */
export function periodsBetween(from: string, to: string) {
  const periods: string[] = []
  for (let p = from; p <= to; p = shiftPeriod(p, 1)) periods.push(p)
  return periods
}

/** Clé d'une échéance. */
export const dueId = (leaseId: string, period: string) => `${leaseId}:${period}`

/**
 * Date d'échéance d'un mois : le jour d'échéance du bail,
 * ou le début du bail s'il commence plus tard dans ce mois.
 */
export function dueDateFor(lease: Lease, period: string) {
  const date = `${period}-${String(lease.paymentDay).padStart(2, '0')}`
  return lease.startDate.slice(0, 7) === period && lease.startDate > date ? lease.startDate : date
}

/**
 * Échéances d'un contrat, du premier mois du bail jusqu'au mois courant
 * (ou jusqu'au mois de fin s'il est résilié). Un contrat à venir n'a pas encore d'échéance.
 */
export function leaseDues(lease: Lease, payments: Payment[], today = todayIso()): RentDue[] {
  if (leaseStatus(lease, today) === 'upcoming') return []
  const last = [effectiveEnd(lease).slice(0, 7), today.slice(0, 7)].sort()[0]
  const byPeriod = new Map<string, Payment[]>()
  for (const p of payments) {
    const list = byPeriod.get(p.period) ?? []
    list.push(p)
    byPeriod.set(p.period, list)
  }

  return periodsBetween(lease.startDate.slice(0, 7), last).map((period) => {
    const dueDate = dueDateFor(lease, period)
    const amount = lease.rent + lease.charges
    const list = (byPeriod.get(period) ?? []).sort((a, b) => a.date.localeCompare(b.date))
    const paid = list.reduce((s, p) => s + p.amount, 0)
    const remaining = Math.max(amount - paid, 0)
    const overdue = dueDate < today
    const status: RentStatus =
      remaining === 0 ? 'paid' : !overdue ? 'due' : paid > 0 ? 'partial' : 'late'
    return {
      id: dueId(lease.id, period),
      leaseId: lease.id,
      period,
      dueDate,
      amount,
      paid,
      remaining,
      status,
      daysLate: overdue && remaining > 0 ? -daysUntil(dueDate, today) : 0,
      payments: list,
    }
  })
}

/** Échéances de tous les contrats. */
export function buildDues(leases: Lease[], payments: Payment[], today = todayIso()) {
  const byLease = new Map<string, Payment[]>()
  for (const p of payments) {
    const list = byLease.get(p.leaseId) ?? []
    list.push(p)
    byLease.set(p.leaseId, list)
  }
  return leases.flatMap((l) => leaseDues(l, byLease.get(l.id) ?? [], today))
}

/** Échéance dépassée et non soldée. */
export const isOverdue = (due: RentDue) => due.status === 'late' || due.status === 'partial'

/** Contrats ayant au moins une échéance impayée. */
export const lateLeaseIds = (dues: RentDue[]) =>
  new Set(dues.filter(isOverdue).map((d) => d.leaseId))

/** Indicateurs d'un ensemble d'échéances. */
export function duesSummary(rows: RentDueRow[]) {
  const expected = rows.reduce((s, r) => s + r.due.amount, 0)
  const collected = rows.reduce((s, r) => s + r.due.paid, 0)
  const overdue = rows.filter((r) => isOverdue(r.due))
  return {
    expected,
    collected,
    remaining: expected - collected,
    rate: expected ? collected / expected : 0,
    overdueCount: overdue.length,
    overdueAmount: overdue.reduce((s, r) => s + r.due.remaining, 0),
    paidCount: rows.filter((r) => r.due.status === 'paid').length,
  }
}

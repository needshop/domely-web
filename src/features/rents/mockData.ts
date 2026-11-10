import { leasesMock } from '@/features/contracts/mockData'
import { propertiesMock } from '@/features/properties/mockData'
import { addDays, todayIso } from '@/lib/dates'
import type { Payment, PaymentMethod } from './types'
import { leaseDues, shiftPeriod } from './utils'

/**
 * Données fictives des encaissements, en attendant l'API (../api).
 * Générées par rapport à la date du jour : tous les loyers passés sont réglés, sauf pour
 * quelques locataires en retard (lots marqués « late » dans les biens fictifs).
 */

const today = todayIso()
const currentPeriod = today.slice(0, 7)

/** Contrats des lots en retard, dans l'ordre des biens. */
const lateLeases = propertiesMock.flatMap((p) =>
  p.units.filter((u) => u.isLate && u.lease).map((u) => u.lease!.id),
)

const methods: PaymentMethod[] = ['mobileMoney', 'mobileMoney', 'bankTransfer', 'cash', 'check']

function payment(
  leaseId: string,
  period: string,
  date: string,
  amount: number,
  seq: number,
): Payment {
  const method = methods[seq % methods.length]
  const digits = String(seq * 7919 + 100_000).slice(-6)
  return {
    id: `pay-${leaseId}-${period}`,
    leaseId,
    period,
    date: date > today ? today : date,
    amount,
    method,
    reference:
      method === 'mobileMoney'
        ? `MP${period.replace('-', '').slice(2)}.${digits}`
        : method === 'bankTransfer'
          ? `VIR-${digits}`
          : method === 'check'
            ? `CHQ ${digits}`
            : undefined,
  }
}

export const paymentsMock: Payment[] = leasesMock.flatMap((lease, leaseIndex) => {
  const lateRank = lateLeases.indexOf(lease.id)
  const previous = shiftPeriod(currentPeriod, -1)

  return leaseDues(lease, [], today).flatMap((due, i) => {
    const seq = leaseIndex * 31 + i
    // Réglé entre 2 jours avant et 3 jours après l'échéance
    const paidOn = addDays(due.dueDate, (seq % 6) - 2)
    const full = [payment(lease.id, due.period, paidOn, due.amount, seq)]

    if (lateRank >= 0) {
      // Retards : le mois courant n'est pas réglé…
      if (due.period === currentPeriod) return []
      // … ni le mois précédent (réglé à moitié pour le 2ᵉ locataire en retard)
      if (due.period === previous) {
        return lateRank === 1 ? [payment(lease.id, due.period, paidOn, due.amount / 2, seq)] : []
      }
      // Le 1ᵉʳ locataire en retard cumule trois mois impayés
      if (lateRank === 0 && due.period === shiftPeriod(currentPeriod, -2)) return []
      return full
    }

    // Mois courant : réglé si l'échéance est passée, sinon parfois réglé d'avance
    if (due.period === currentPeriod && due.dueDate >= today && seq % 3 !== 0) return []
    return full
  })
})

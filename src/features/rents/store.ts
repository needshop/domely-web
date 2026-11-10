import { paymentsMock } from './mockData'
import type { Payment } from './types'

/**
 * Store en mémoire des encaissements (le temps de brancher l'API).
 * Les ajouts / annulations sont visibles partout dans l'app mais perdus au rechargement.
 */
let payments: Payment[] = paymentsMock
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((l) => l())

export const paymentsStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: () => payments,

  create(payment: Payment) {
    payments = [...payments, payment]
    emit()
  },

  remove(id: string) {
    payments = payments.filter((p) => p.id !== id)
    emit()
  },
}

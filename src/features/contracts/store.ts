import { leasesMock } from './mockData'
import type { Lease } from './types'

/**
 * Store en mémoire des contrats (le temps de brancher l'API).
 * Les ajouts / modifications sont visibles partout dans l'app mais perdus au rechargement.
 */
let leases: Lease[] = leasesMock
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((l) => l())

export const leasesStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: () => leases,

  create(lease: Lease) {
    leases = [lease, ...leases]
    emit()
  },

  update(lease: Lease) {
    leases = leases.map((l) => (l.id === lease.id ? lease : l))
    emit()
  },
}

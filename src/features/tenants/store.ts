import { tenantsMock } from './mockData'
import type { Tenant } from './types'

/**
 * Store en mémoire des locataires (le temps de brancher l'API).
 * Les ajouts / modifications sont visibles partout dans l'app mais perdus au rechargement.
 */
let tenants: Tenant[] = tenantsMock
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((l) => l())

export const tenantsStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: () => tenants,

  create(tenant: Tenant) {
    tenants = [tenant, ...tenants]
    emit()
  },

  update(tenant: Tenant) {
    tenants = tenants.map((t) => (t.id === tenant.id ? tenant : t))
    emit()
  },
}

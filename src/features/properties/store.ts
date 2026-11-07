import { propertiesMock } from './mockData'
import type { Property } from './types'

/**
 * Store en mémoire des biens (le temps de brancher l'API).
 * Les ajouts / modifications sont visibles partout dans l'app mais perdus au rechargement.
 */
let properties: Property[] = propertiesMock
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((l) => l())

export const propertiesStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: () => properties,

  create(property: Property) {
    properties = [property, ...properties]
    emit()
  },

  update(property: Property) {
    properties = properties.map((p) => (p.id === property.id ? property : p))
    emit()
  },
}

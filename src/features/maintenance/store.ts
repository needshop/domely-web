import { interventionsMock } from './mockData'
import type { Intervention } from './types'

/**
 * Store en mémoire des interventions (le temps de brancher l'API).
 * Les ajouts / modifications sont visibles partout dans l'app mais perdus au rechargement.
 */
let interventions: Intervention[] = interventionsMock
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((l) => l())

export const interventionsStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: () => interventions,

  create(intervention: Intervention) {
    interventions = [intervention, ...interventions]
    emit()
  },

  update(intervention: Intervention) {
    interventions = interventions.map((i) => (i.id === intervention.id ? intervention : i))
    emit()
  },
}

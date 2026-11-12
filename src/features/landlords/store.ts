import { landlordsMock } from './mockData'
import type { Landlord } from './types'

/**
 * Store en mémoire des bailleurs (le temps de brancher l'API).
 * Les ajouts / modifications sont visibles partout dans l'app mais perdus au rechargement.
 */
let landlords: Landlord[] = landlordsMock
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((l) => l())

export const landlordsStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: () => landlords,

  create(landlord: Landlord) {
    landlords = [landlord, ...landlords]
    emit()
  },

  update(landlord: Landlord) {
    landlords = landlords.map((l) => (l.id === landlord.id ? landlord : l))
    emit()
  },
}

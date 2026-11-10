import type { Reminder } from './types'

/**
 * Store en mémoire des relances (le temps de brancher l'API).
 * Perdu au rechargement, comme les autres données de démonstration.
 */
let reminders: Reminder[] = []
const listeners = new Set<() => void>()

export const remindersStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: () => reminders,

  create(reminder: Reminder) {
    reminders = [...reminders, reminder]
    listeners.forEach((l) => l())
  },
}

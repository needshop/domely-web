import { defaultSettings } from './defaults'
import type { Settings } from './types'

export const SETTINGS_STORAGE_KEY = 'domely-settings'

/**
 * Lecture tolérante : on part des valeurs par défaut et on n'applique que les sections
 * enregistrées (un champ ajouté dans une future version garde sa valeur par défaut).
 */
function load(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return defaultSettings
    const saved = JSON.parse(raw) as Partial<Settings>
    return {
      profile: { ...defaultSettings.profile, ...saved.profile },
      organization: { ...defaultSettings.organization, ...saved.organization },
      rentals: { ...defaultSettings.rentals, ...saved.rentals },
      exchangeRates: { ...defaultSettings.exchangeRates, ...saved.exchangeRates },
      reminder: { ...defaultSettings.reminder, ...saved.reminder },
    }
  } catch {
    return defaultSettings
  }
}

/**
 * Paramètres de l'utilisateur, enregistrés dans le navigateur (localStorage) en attendant
 * l'API : contrairement aux données de démonstration, ils survivent au rechargement.
 */
let settings: Settings = load()
const listeners = new Set<() => void>()

function save(next: Settings) {
  settings = next
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* stockage indisponible : on garde les paramètres en mémoire */
  }
  listeners.forEach((l) => l())
}

export const settingsStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: () => settings,

  update<K extends keyof Settings>(section: K, value: Settings[K]) {
    save({ ...settings, [section]: value })
  },

  reset() {
    save(defaultSettings)
  },
}

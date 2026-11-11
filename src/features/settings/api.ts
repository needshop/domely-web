import { useSyncExternalStore } from 'react'
import { settingsStore } from './store'
import type { Settings } from './types'

/** Paramètres de l'utilisateur (réactifs). */
export function useSettings(): Settings {
  return useSyncExternalStore(settingsStore.subscribe, settingsStore.getSnapshot)
}

export async function updateSettings<K extends keyof Settings>(
  section: K,
  value: Settings[K],
): Promise<void> {
  settingsStore.update(section, value)
}

export async function resetSettings(): Promise<void> {
  settingsStore.reset()
}

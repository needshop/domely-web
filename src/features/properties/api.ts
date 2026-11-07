import { useSyncExternalStore } from 'react'
import { propertiesStore } from './store'
import type { Property } from './types'

/**
 * Accès aux biens. Lit le store en mémoire pour l'instant ; ces hooks seront branchés
 * sur l'API (ex. TanStack Query) sans changer les composants qui les utilisent.
 */
export function useProperties(): Property[] {
  return useSyncExternalStore(propertiesStore.subscribe, propertiesStore.getSnapshot)
}

export function useProperty(id: string | undefined): Property | undefined {
  return useProperties().find((p) => p.id === id)
}

export async function createProperty(property: Property): Promise<Property> {
  propertiesStore.create(property)
  return property
}

export async function updateProperty(property: Property): Promise<Property> {
  propertiesStore.update(property)
  return property
}

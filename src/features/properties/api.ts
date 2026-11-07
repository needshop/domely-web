import { propertiesMock } from './mockData'
import type { Property } from './types'

/**
 * Accès aux biens. Lit les données fictives pour l'instant ; ces hooks seront branchés
 * sur l'API (ex. TanStack Query) sans changer les composants qui les utilisent.
 */
export function useProperties(): Property[] {
  return propertiesMock
}

export function useProperty(id: string | undefined): Property | undefined {
  return propertiesMock.find((p) => p.id === id)
}

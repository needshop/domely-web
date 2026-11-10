import { useMemo, useSyncExternalStore } from 'react'
import { leasesStore } from '@/features/contracts/store'
import { applyLeases } from '@/features/contracts/utils'
import { propertiesStore } from './store'
import type { Property } from './types'

/**
 * Accès aux biens. Lit le store en mémoire pour l'instant ; ces hooks seront branchés
 * sur l'API (ex. TanStack Query) sans changer les composants qui les utilisent.
 */

/** Biens tels qu'enregistrés, sans les informations de location des contrats. */
export function useRawProperties(): Property[] {
  return useSyncExternalStore(propertiesStore.subscribe, propertiesStore.getSnapshot)
}

/** Biens avec la situation locative de chaque lot (contrat en cours, loyer, locataire). */
export function useProperties(): Property[] {
  const properties = useRawProperties()
  const leases = useSyncExternalStore(leasesStore.subscribe, leasesStore.getSnapshot)
  return useMemo(() => applyLeases(properties, leases), [properties, leases])
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

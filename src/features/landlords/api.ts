import { useMemo, useSyncExternalStore } from 'react'
import { useProperties } from '@/features/properties/api'
import { landlordsStore } from './store'
import type { Landlord, LandlordRow } from './types'
import { landlordRows } from './utils'

/**
 * Accès aux bailleurs. Lit le store en mémoire pour l'instant ; ces hooks seront branchés
 * sur l'API sans changer les composants qui les utilisent.
 */
export function useLandlords(): Landlord[] {
  return useSyncExternalStore(landlordsStore.subscribe, landlordsStore.getSnapshot)
}

/** Bailleurs avec leurs biens et indicateurs (loyers, occupation, honoraires). */
export function useLandlordRows(): LandlordRow[] {
  const landlords = useLandlords()
  const properties = useProperties()
  return useMemo(() => landlordRows(landlords, properties), [landlords, properties])
}

export function useLandlordRow(id: string | undefined): LandlordRow | undefined {
  return useLandlordRows().find((r) => r.landlord.id === id)
}

export function useLandlord(id: string | undefined): Landlord | undefined {
  return useLandlords().find((l) => l.id === id)
}

export async function createLandlord(landlord: Landlord): Promise<Landlord> {
  landlordsStore.create(landlord)
  return landlord
}

export async function updateLandlord(landlord: Landlord): Promise<Landlord> {
  landlordsStore.update(landlord)
  return landlord
}

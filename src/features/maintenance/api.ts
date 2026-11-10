import { useMemo, useSyncExternalStore } from 'react'
import { useProperties } from '@/features/properties/api'
import { useTenants } from '@/features/tenants/api'
import { interventionsStore } from './store'
import type { Intervention, InterventionRow } from './types'

/**
 * Accès aux interventions. Lit le store en mémoire pour l'instant ; ces hooks seront branchés
 * sur l'API sans changer les composants qui les utilisent.
 */
export function useInterventions(): Intervention[] {
  return useSyncExternalStore(interventionsStore.subscribe, interventionsStore.getSnapshot)
}

/** Interventions avec bien, lot et locataire. */
export function useInterventionRows(): InterventionRow[] {
  const interventions = useInterventions()
  const properties = useProperties()
  const tenants = useTenants()
  return useMemo(() => {
    const propertyById = new Map(properties.map((p) => [p.id, p]))
    const tenantById = new Map(tenants.map((t) => [t.id, t]))
    return interventions.map((intervention) => {
      const property = propertyById.get(intervention.propertyId)
      return {
        intervention,
        property,
        unit: intervention.unitId
          ? property?.units.find((u) => u.id === intervention.unitId)
          : undefined,
        tenant: intervention.tenantId ? tenantById.get(intervention.tenantId) : undefined,
      }
    })
  }, [interventions, properties, tenants])
}

export function useInterventionRow(id: string | undefined): InterventionRow | undefined {
  return useInterventionRows().find((r) => r.intervention.id === id)
}

export async function createIntervention(intervention: Intervention): Promise<Intervention> {
  interventionsStore.create(intervention)
  return intervention
}

export async function updateIntervention(intervention: Intervention): Promise<Intervention> {
  interventionsStore.update(intervention)
  return intervention
}

import { useMemo, useSyncExternalStore } from 'react'
import { useRawProperties } from '@/features/properties/api'
import { useTenants } from '@/features/tenants/api'
import { leasesStore } from './store'
import type { Lease, LeaseRow, TerminationReason } from './types'
import { leaseStatus } from './utils'

/**
 * Accès aux contrats. Lit le store en mémoire pour l'instant ; ces hooks seront branchés
 * sur l'API sans changer les composants qui les utilisent.
 */
export function useLeases(): Lease[] {
  return useSyncExternalStore(leasesStore.subscribe, leasesStore.getSnapshot)
}

/** Contrats avec bien, lot, locataire et situation. */
export function useLeaseRows(): LeaseRow[] {
  const leases = useLeases()
  const properties = useRawProperties()
  const tenants = useTenants()
  return useMemo(() => {
    const propertyById = new Map(properties.map((p) => [p.id, p]))
    const tenantById = new Map(tenants.map((t) => [t.id, t]))
    return leases.map((lease) => {
      const property = propertyById.get(lease.propertyId)
      return {
        lease,
        status: leaseStatus(lease),
        property,
        unit: property?.units.find((u) => u.id === lease.unitId),
        tenant: tenantById.get(lease.tenantId),
      }
    })
  }, [leases, properties, tenants])
}

export function useLeaseRow(id: string | undefined): LeaseRow | undefined {
  return useLeaseRows().find((r) => r.lease.id === id)
}

export async function createLease(lease: Lease): Promise<Lease> {
  leasesStore.create(lease)
  return lease
}

export async function updateLease(lease: Lease): Promise<Lease> {
  leasesStore.update(lease)
  return lease
}

export async function terminateLease(
  lease: Lease,
  terminatedAt: string,
  reason: TerminationReason,
): Promise<Lease> {
  const updated = { ...lease, terminatedAt, terminationReason: reason }
  leasesStore.update(updated)
  return updated
}

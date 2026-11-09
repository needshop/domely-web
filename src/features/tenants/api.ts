import { useMemo, useSyncExternalStore } from 'react'
import { useProperties } from '@/features/properties/api'
import { tenantsStore } from './store'
import type { Tenant, TenantRow } from './types'
import { tenantRows } from './utils'

/**
 * Accès aux locataires. Lit le store en mémoire pour l'instant ; ces hooks seront branchés
 * sur l'API sans changer les composants qui les utilisent.
 */
export function useTenants(): Tenant[] {
  return useSyncExternalStore(tenantsStore.subscribe, tenantsStore.getSnapshot)
}

/** Locataires avec leurs baux en cours (déduits des lots loués). */
export function useTenantRows(): TenantRow[] {
  const tenants = useTenants()
  const properties = useProperties()
  return useMemo(() => tenantRows(tenants, properties), [tenants, properties])
}

export function useTenantRow(id: string | undefined): TenantRow | undefined {
  return useTenantRows().find((r) => r.tenant.id === id)
}

/** Résout le nom d'un locataire à partir de son identifiant. */
export function useTenantNames() {
  const tenants = useTenants()
  return useMemo(() => {
    const names = new Map(tenants.map((t) => [t.id, t.name]))
    return (id: string | undefined) => (id ? names.get(id) : undefined)
  }, [tenants])
}

export async function createTenant(tenant: Tenant): Promise<Tenant> {
  tenantsStore.create(tenant)
  return tenant
}

export async function updateTenant(tenant: Tenant): Promise<Tenant> {
  tenantsStore.update(tenant)
  return tenant
}

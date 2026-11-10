import { isLeaseEndingSoon } from '@/features/contracts/utils'
import type { Property } from '@/features/properties/types'
import type { Tenant, TenantLease, TenantRow, TenantStatus } from './types'

/** Index locataire → baux en cours, construit à partir des lots loués. */
export function leasesByTenant(properties: Property[]) {
  const index = new Map<string, TenantLease[]>()
  for (const property of properties) {
    for (const unit of property.units) {
      if (unit.status !== 'rented' || !unit.lease) continue
      const list = index.get(unit.lease.tenantId) ?? []
      list.push({ property, unit, lease: unit.lease })
      index.set(unit.lease.tenantId, list)
    }
  }
  return index
}

/** Locataire + baux → ligne enrichie (situation, montant mensuel, prochaine échéance). */
export function tenantRow(tenant: Tenant, leases: TenantLease[] = []): TenantRow {
  const status: TenantStatus =
    leases.length === 0 ? 'inactive' : leases.some((l) => l.unit.isLate) ? 'late' : 'active'
  return {
    tenant,
    leases,
    status,
    monthlyDue: leases.reduce((sum, l) => sum + l.unit.rent + l.unit.charges, 0),
    nextLeaseEnd: leases.map((l) => l.lease.endDate).sort()[0],
  }
}

export function tenantRows(tenants: Tenant[], properties: Property[]): TenantRow[] {
  const index = leasesByTenant(properties)
  return tenants.map((t) => tenantRow(t, index.get(t.id)))
}

/** Indicateurs agrégés des locataires. */
export function tenantsSummary(rows: TenantRow[]) {
  return {
    total: rows.length,
    active: rows.filter((r) => r.status !== 'inactive').length,
    late: rows.filter((r) => r.status === 'late').length,
    endingSoon: rows.filter((r) => r.nextLeaseEnd && isLeaseEndingSoon(r.nextLeaseEnd)).length,
    monthlyDue: rows.reduce((sum, r) => sum + r.monthlyDue, 0),
  }
}

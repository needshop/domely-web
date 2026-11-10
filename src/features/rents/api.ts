import { useMemo, useSyncExternalStore } from 'react'
import { useLeases } from '@/features/contracts/api'
import { useRawProperties } from '@/features/properties/api'
import { useTenants } from '@/features/tenants/api'
import { remindersStore } from './remindersStore'
import { paymentsStore } from './store'
import type { Payment, Reminder, RentDueRow } from './types'
import { buildDues, dueId } from './utils'

/**
 * Accès aux loyers. Les échéances sont calculées à partir des contrats ; seuls les
 * encaissements sont stockés. Ces hooks seront branchés sur l'API sans changer les composants.
 */
export function usePayments(): Payment[] {
  return useSyncExternalStore(paymentsStore.subscribe, paymentsStore.getSnapshot)
}

export function useReminders(): Reminder[] {
  return useSyncExternalStore(remindersStore.subscribe, remindersStore.getSnapshot)
}

/** Toutes les échéances, avec contrat, locataire, logement et dernière relance. */
export function useRentDues(): RentDueRow[] {
  const leases = useLeases()
  const payments = usePayments()
  const reminders = useReminders()
  const properties = useRawProperties()
  const tenants = useTenants()

  return useMemo(() => {
    const leaseById = new Map(leases.map((l) => [l.id, l]))
    const propertyById = new Map(properties.map((p) => [p.id, p]))
    const tenantById = new Map(tenants.map((t) => [t.id, t]))
    // Relances triées par date : la dernière écrase les précédentes
    const lastReminder = new Map(
      [...reminders]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((r) => [dueId(r.leaseId, r.period), r]),
    )
    return buildDues(leases, payments).map((due) => {
      const lease = leaseById.get(due.leaseId)!
      const property = propertyById.get(lease.propertyId)
      return {
        due,
        lease,
        tenant: tenantById.get(lease.tenantId),
        property,
        unit: property?.units.find((u) => u.id === lease.unitId),
        lastReminder: lastReminder.get(due.id),
      }
    })
  }, [leases, payments, reminders, properties, tenants])
}

const newId = () => `pay-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export async function recordPayment(payment: Omit<Payment, 'id'>): Promise<Payment> {
  const created = { ...payment, id: newId() }
  paymentsStore.create(created)
  return created
}

export async function cancelPayment(id: string): Promise<void> {
  paymentsStore.remove(id)
}

export async function recordReminder(reminder: Omit<Reminder, 'id'>): Promise<Reminder> {
  const created = {
    ...reminder,
    id: `rem-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
  }
  remindersStore.create(created)
  return created
}

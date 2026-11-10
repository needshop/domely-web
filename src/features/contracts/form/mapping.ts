import type { Property, Unit } from '@/features/properties/types'
import { addDays, addMonths, todayIso } from '@/lib/dates'
import type { Lease, LeaseType } from '../types'
import { leaseTypeForUnit, nextReference } from '../utils'
import type { LeaseFormValues } from './schema'

const newId = () => `l-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

/** Fin par défaut : un an après le début, la veille du jour anniversaire. */
export const defaultEndDate = (start: string) => addDays(addMonths(start, 12), -1)

/** Dépôt de garantie d'usage : 2 mois de loyer en habitation, 3 sinon. */
export const defaultDeposit = (rent: number, type: LeaseType) =>
  rent * (type === 'residential' ? 2 : 3)

/** Conditions proposées pour un lot : nature du bail, loyer et charges de référence. */
export function unitDefaults(unit: Unit) {
  const type = leaseTypeForUnit(unit.kind)
  return {
    type,
    rent: unit.rent,
    charges: unit.charges,
    deposit: defaultDeposit(unit.rent, type),
  }
}

/** Valeurs initiales d'un nouveau contrat (pré-remplies depuis un lot ou un locataire). */
export function emptyLeaseValues(prefill: {
  tenantId?: string | null
  property?: Property
  unit?: Unit
}): LeaseFormValues {
  const start = addMonths(todayIso().slice(0, 8) + '01', 1)
  return {
    tenantId: prefill.tenantId ?? null,
    propertyId: prefill.property?.id ?? null,
    unitId: prefill.unit?.id ?? null,
    type: 'residential',
    startDate: start,
    endDate: defaultEndDate(start),
    rent: null,
    charges: null,
    deposit: null,
    paymentDay: 5,
    tacitRenewal: true,
    notes: '',
    ...(prefill.unit ? unitDefaults(prefill.unit) : {}),
  }
}

/** Contrat existant → valeurs du formulaire. */
export function toFormValues(lease: Lease): LeaseFormValues {
  return {
    tenantId: lease.tenantId,
    propertyId: lease.propertyId,
    unitId: lease.unitId,
    type: lease.type,
    startDate: lease.startDate,
    endDate: lease.endDate,
    rent: lease.rent,
    charges: lease.charges,
    deposit: lease.deposit,
    paymentDay: lease.paymentDay,
    tacitRenewal: lease.tacitRenewal,
    notes: lease.notes ?? '',
  }
}

/** Valeurs du formulaire → contrat (référence attribuée à la création). */
export function fromFormValues(v: LeaseFormValues, all: Lease[], existing?: Lease): Lease {
  return {
    ...existing,
    id: existing?.id ?? newId(),
    reference: existing?.reference ?? nextReference(all, v.startDate.slice(0, 4)),
    createdAt: existing?.createdAt ?? todayIso(),
    tenantId: v.tenantId!,
    propertyId: v.propertyId!,
    unitId: v.unitId!,
    type: v.type,
    startDate: v.startDate,
    endDate: v.endDate,
    rent: v.rent ?? 0,
    charges: v.charges ?? 0,
    deposit: v.deposit ?? 0,
    paymentDay: v.paymentDay ?? 5,
    tacitRenewal: v.tacitRenewal,
    notes: v.notes.trim() || undefined,
  }
}

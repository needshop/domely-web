import type { Property, Unit } from '@/features/properties/types'
import type { RentalDefaults } from '@/features/settings/types'
import { addDays, addMonths, todayIso } from '@/lib/dates'
import type { Lease, LeaseType } from '../types'
import { leaseTypeForUnit, nextReference } from '../utils'
import type { LeaseFormValues } from './schema'

const newId = () => `l-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

/** Fin par défaut : la durée de bail des paramètres, la veille du jour anniversaire. */
export const defaultEndDate = (start: string, months = 12) => addDays(addMonths(start, months), -1)

/** Dépôt de garantie d'usage (paramètres) : en mois de loyer, selon la nature du bail. */
export const defaultDeposit = (rent: number, type: LeaseType, defaults: RentalDefaults) =>
  rent *
  (type === 'residential' ? defaults.depositMonthsResidential : defaults.depositMonthsCommercial)

/** Conditions proposées pour un lot : nature du bail, loyer et charges de référence. */
export function unitDefaults(unit: Unit, defaults: RentalDefaults) {
  const type = leaseTypeForUnit(unit.kind)
  return {
    type,
    rent: unit.rent,
    charges: unit.charges,
    deposit: defaultDeposit(unit.rent, type, defaults),
  }
}

/** Valeurs initiales d'un nouveau contrat (pré-remplies depuis un lot ou un locataire). */
export function emptyLeaseValues(
  prefill: { tenantId?: string | null; property?: Property; unit?: Unit },
  defaults: RentalDefaults,
): LeaseFormValues {
  const start = addMonths(todayIso().slice(0, 8) + '01', 1)
  return {
    tenantId: prefill.tenantId ?? null,
    propertyId: prefill.property?.id ?? null,
    unitId: prefill.unit?.id ?? null,
    type: 'residential',
    startDate: start,
    endDate: defaultEndDate(start, defaults.leaseMonths),
    rent: null,
    charges: null,
    deposit: null,
    paymentDay: defaults.paymentDay,
    tacitRenewal: defaults.tacitRenewal,
    notes: '',
    ...(prefill.unit ? unitDefaults(prefill.unit, defaults) : {}),
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

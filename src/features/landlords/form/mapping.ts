import { todayIso } from '@/lib/dates'
import type { Landlord } from '../types'
import { type LandlordFormValues, residenceCountries } from './schema'

const newId = () => `l-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

/** Valeurs initiales d'un nouveau bailleur. */
export function emptyLandlordValues(): LandlordFormValues {
  return {
    kind: 'individual',
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    city: '',
    country: 'SN',
    mandateStart: '',
    feeRate: null,
    notes: '',
  }
}

const isResidenceCountry = (c: string | undefined): c is (typeof residenceCountries)[number] =>
  (residenceCountries as readonly string[]).includes(c ?? '')

/** Bailleur existant → valeurs du formulaire. */
export function toFormValues(l: Landlord): LandlordFormValues {
  return {
    kind: l.kind,
    name: l.name,
    contactPerson: l.contactPerson ?? '',
    phone: l.phone,
    email: l.email,
    city: l.city ?? '',
    country: isResidenceCountry(l.country) ? l.country : null,
    mandateStart: l.mandateStart ?? '',
    feeRate: l.feeRate ?? null,
    notes: l.notes ?? '',
  }
}

/** Valeurs du formulaire → bailleur (l'interlocuteur ne concerne que les sociétés). */
export function fromFormValues(v: LandlordFormValues, existing?: Landlord): Landlord {
  const text = (s: string) => s.trim() || undefined
  return {
    id: existing?.id ?? newId(),
    createdAt: existing?.createdAt ?? todayIso(),
    kind: v.kind,
    name: v.name.trim(),
    contactPerson: v.kind === 'company' ? text(v.contactPerson) : undefined,
    phone: v.phone.trim(),
    email: v.email.trim(),
    city: text(v.city),
    country: v.country ?? undefined,
    mandateStart: v.mandateStart || undefined,
    feeRate: v.feeRate ?? undefined,
    notes: text(v.notes),
  }
}

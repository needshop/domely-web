import type { Property, PropertyType, Unit } from '../types'
import { defaultUnitKind, type PropertyFormValues, type UnitFormValues } from './schema'

const today = () => new Date().toISOString().slice(0, 10)
const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

/** Lot vide pour un type de bien donné. */
export function emptyUnit(type: PropertyType, index: number, labelPrefix: string): UnitFormValues {
  return {
    label: `${labelPrefix} ${index + 1}`,
    kind: defaultUnitKind[type],
    floor: null,
    area: null,
    rooms: null,
    rent: null,
    charges: null,
    status: 'vacant',
  }
}

/** Valeurs initiales d'un nouveau bien. */
export function emptyPropertyValues(labelPrefix: string): PropertyFormValues {
  return {
    name: '',
    type: 'residence',
    description: '',
    address: { street: '', district: '', city: '', country: 'SN' },
    acquiredAt: '',
    units: [emptyUnit('residence', 0, labelPrefix)],
  }
}

/** Bien existant → valeurs du formulaire. */
export function toFormValues(p: Property): PropertyFormValues {
  return {
    name: p.name,
    type: p.type,
    description: p.description ?? '',
    address: {
      ...p.address,
      country: p.address.country as PropertyFormValues['address']['country'],
    },
    acquiredAt: p.acquiredAt ?? '',
    units: p.units.map((u) => ({
      id: u.id,
      label: u.label,
      kind: u.kind,
      floor: u.floor ?? null,
      area: u.area,
      rooms: u.rooms ?? null,
      rent: u.rent,
      charges: u.charges,
      status: u.status,
      tenantId: u.lease?.tenantId,
    })),
  }
}

/**
 * Valeurs du formulaire → bien. En modification, conserve l'identifiant, la date d'ajout
 * et les informations de location (locataire, retard) des lots existants.
 */
export function fromFormValues(values: PropertyFormValues, existing?: Property): Property {
  const previousUnits = new Map(existing?.units.map((u) => [u.id, u]))

  const units: Unit[] = values.units.map((u) => {
    const previous = u.id ? previousUnits.get(u.id) : undefined
    return {
      id: previous?.id ?? newId('u'),
      label: u.label.trim(),
      kind: u.kind,
      floor: u.floor ?? undefined,
      area: u.area ?? 0,
      rooms: u.rooms ?? undefined,
      rent: u.rent ?? 0,
      charges: u.charges ?? 0,
      status: u.status,
      lease: u.status === 'rented' ? previous?.lease : undefined,
      isLate: u.status === 'rented' ? previous?.isLate : undefined,
    }
  })

  return {
    id: existing?.id ?? newId('p'),
    createdAt: existing?.createdAt ?? today(),
    name: values.name.trim(),
    type: values.type,
    description: values.description.trim() || undefined,
    address: {
      street: values.address.street.trim(),
      district: values.address.district.trim(),
      city: values.address.city.trim(),
      country: values.address.country,
    },
    acquiredAt: values.acquiredAt || undefined,
    units,
  }
}

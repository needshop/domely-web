import type { Tenant } from '../types'
import { todayIso } from '../utils'
import { idDocumentsByKind, type TenantFormValues } from './schema'

const newId = () => `t-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

/** Valeurs initiales d'un nouveau locataire. */
export function emptyTenantValues(): TenantFormValues {
  return {
    kind: 'individual',
    name: '',
    occupation: '',
    contactPerson: '',
    phone: '',
    email: '',
    idType: null,
    idNumber: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: null,
    notes: '',
  }
}

/** Locataire existant → valeurs du formulaire. */
export function toFormValues(tenant: Tenant): TenantFormValues {
  return {
    kind: tenant.kind,
    name: tenant.name,
    occupation: tenant.occupation ?? '',
    contactPerson: tenant.contactPerson ?? '',
    phone: tenant.phone,
    email: tenant.email ?? '',
    idType: tenant.idDocument?.type ?? null,
    idNumber: tenant.idDocument?.number ?? '',
    emergencyName: tenant.emergencyContact?.name ?? '',
    emergencyPhone: tenant.emergencyContact?.phone ?? '',
    emergencyRelation: tenant.emergencyContact?.relation ?? null,
    notes: tenant.notes ?? '',
  }
}

/**
 * Valeurs du formulaire → locataire. Les champs propres à l'autre type de locataire
 * (interlocuteur pour une société, personne à prévenir pour un particulier) sont ignorés.
 */
export function fromFormValues(v: TenantFormValues, existing?: Tenant): Tenant {
  const isCompany = v.kind === 'company'
  const idType = v.idType && idDocumentsByKind[v.kind].includes(v.idType) ? v.idType : null
  const text = (s: string) => s.trim() || undefined

  return {
    id: existing?.id ?? newId(),
    createdAt: existing?.createdAt ?? todayIso(),
    kind: v.kind,
    name: v.name.trim(),
    phone: v.phone.trim(),
    email: text(v.email),
    occupation: text(v.occupation),
    contactPerson: isCompany ? text(v.contactPerson) : undefined,
    idDocument:
      idType && v.idNumber.trim() ? { type: idType, number: v.idNumber.trim() } : undefined,
    emergencyContact:
      !isCompany && v.emergencyName.trim() && v.emergencyPhone.trim()
        ? {
            name: v.emergencyName.trim(),
            phone: v.emergencyPhone.trim(),
            relation: v.emergencyRelation ?? 'other',
          }
        : undefined,
    notes: text(v.notes),
  }
}

import type { Property } from '@/features/properties/types'
import { todayIso } from '@/lib/dates'
import type { Intervention } from '../types'
import { nextReference, withStatus } from '../utils'
import { COMMON_AREAS, type InterventionFormValues } from './schema'

const newId = () => `m-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

/** Valeurs initiales d'une nouvelle intervention (pré-remplies depuis un bien ou un lot). */
export function emptyInterventionValues(prefill: {
  propertyId?: string | null
  unitId?: string | null
}): InterventionFormValues {
  return {
    propertyId: prefill.propertyId ?? null,
    unitId: prefill.unitId ?? (prefill.propertyId ? COMMON_AREAS : null),
    title: '',
    category: 'plumbing',
    priority: 'normal',
    description: '',
    reportedBy: prefill.unitId ? 'tenant' : 'manager',
    reportedAt: todayIso(),
    scheduledAt: '',
    providerName: '',
    providerPhone: '',
    estimatedCost: null,
    chargedTo: 'owner',
  }
}

export function toFormValues(i: Intervention): InterventionFormValues {
  return {
    propertyId: i.propertyId,
    unitId: i.unitId ?? COMMON_AREAS,
    title: i.title,
    category: i.category,
    priority: i.priority,
    description: i.description ?? '',
    reportedBy: i.reportedBy,
    reportedAt: i.reportedAt,
    scheduledAt: i.scheduledAt ?? '',
    providerName: i.provider?.name ?? '',
    providerPhone: i.provider?.phone ?? '',
    estimatedCost: i.estimatedCost ?? null,
    chargedTo: i.chargedTo,
  }
}

/**
 * Valeurs du formulaire → intervention. Le statut évolue par les actions de la fiche ;
 * seule exception : saisir (ou retirer) une date de passage fait passer une demande
 * de « nouvelle » à « planifiée » (et inversement).
 */
export function fromFormValues(
  v: InterventionFormValues,
  properties: Property[],
  all: Intervention[],
  existing?: Intervention,
): Intervention {
  const unitId = v.unitId === COMMON_AREAS ? undefined : (v.unitId ?? undefined)
  const unit = properties.find((p) => p.id === v.propertyId)?.units.find((u) => u.id === unitId)
  const text = (s: string) => s.trim() || undefined

  const base: Intervention = {
    id: existing?.id ?? newId(),
    reference: existing?.reference ?? nextReference(all, v.reportedAt.slice(0, 4)),
    status: existing?.status ?? (v.scheduledAt ? 'scheduled' : 'new'),
    history: existing?.history ?? [
      { date: v.reportedAt, status: 'new' },
      ...(v.scheduledAt ? [{ date: todayIso(), status: 'scheduled' as const }] : []),
    ],
    completedAt: existing?.completedAt,
    actualCost: existing?.actualCost,
    propertyId: v.propertyId!,
    unitId,
    title: v.title.trim(),
    description: text(v.description),
    category: v.category,
    priority: v.priority,
    reportedBy: v.reportedBy,
    // Locataire en place sur le lot au moment du signalement
    tenantId:
      v.reportedBy === 'tenant'
        ? ((existing?.unitId === unitId ? existing?.tenantId : undefined) ?? unit?.lease?.tenantId)
        : undefined,
    reportedAt: v.reportedAt,
    scheduledAt: text(v.scheduledAt),
    provider: v.providerName.trim()
      ? { name: v.providerName.trim(), phone: text(v.providerPhone) }
      : undefined,
    estimatedCost: v.estimatedCost ?? undefined,
    chargedTo: v.chargedTo,
  }

  if (existing?.status === 'new' && base.scheduledAt) return withStatus(base, 'scheduled')
  if (existing?.status === 'scheduled' && !base.scheduledAt) return withStatus(base, 'new')
  return base
}

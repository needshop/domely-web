import { daysUntil, todayIso } from '@/lib/dates'
import {
  type Intervention,
  type InterventionRow,
  type MaintenanceEvent,
  type MaintenancePriority,
  type MaintenanceStatus,
  openStatuses,
} from './types'

export const isOpen = (status: MaintenanceStatus) => openStatuses.includes(status)

/** Ordre de tri par priorité (urgente d'abord). */
export const priorityOrder: Record<MaintenancePriority, number> = { urgent: 0, normal: 1, low: 2 }

/** Passage planifié dans les 7 prochains jours (ou en retard : date dépassée, non démarrée). */
export const isScheduledSoon = (i: Intervention) =>
  i.status === 'scheduled' && !!i.scheduledAt && daysUntil(i.scheduledAt) <= 7

/** Passage prévu dépassé sans démarrage des travaux. */
export const isOverdue = (i: Intervention) =>
  i.status === 'scheduled' && !!i.scheduledAt && i.scheduledAt < todayIso()

/** Transitions de statut proposées depuis chaque statut. */
export const transitions: Record<MaintenanceStatus, MaintenanceAction[]> = {
  new: ['schedule', 'start', 'cancel'],
  scheduled: ['start', 'schedule', 'cancel'],
  inProgress: ['complete', 'cancel'],
  done: ['reopen'],
  cancelled: ['reopen'],
}
export type MaintenanceAction = 'schedule' | 'start' | 'complete' | 'cancel' | 'reopen'

/** Applique un changement de statut et l'inscrit dans l'historique. */
export function withStatus(
  i: Intervention,
  status: MaintenanceStatus,
  changes: Partial<Intervention> = {},
  note?: string,
): Intervention {
  const event: MaintenanceEvent = { date: todayIso(), status, note: note || undefined }
  return { ...i, ...changes, status, history: [...i.history, event] }
}

/** Prochaine référence pour une année : INT-AAAA-NNNN. */
export function nextReference(all: Intervention[], year: string) {
  const max = all.reduce((m, i) => {
    const match = /^INT-(\d{4})-(\d+)$/.exec(i.reference)
    return match && match[1] === year ? Math.max(m, Number(match[2])) : m
  }, 0)
  return `INT-${year}-${String(max + 1).padStart(4, '0')}`
}

/** Indicateurs agrégés. */
export function maintenanceSummary(rows: InterventionRow[]) {
  const year = todayIso().slice(0, 4)
  const open = rows.filter((r) => isOpen(r.intervention.status))
  const doneThisYear = rows.filter(
    (r) => r.intervention.status === 'done' && r.intervention.completedAt?.startsWith(year),
  )
  return {
    open: open.length,
    urgent: open.filter((r) => r.intervention.priority === 'urgent').length,
    newCount: open.filter((r) => r.intervention.status === 'new').length,
    scheduledSoon: rows.filter((r) => isScheduledSoon(r.intervention)).length,
    inProgress: open.filter((r) => r.intervention.status === 'inProgress').length,
    spentThisYear: doneThisYear.reduce((s, r) => s + (r.intervention.actualCost ?? 0), 0),
    doneThisYear: doneThisYear.length,
  }
}

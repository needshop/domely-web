import { Wrench } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { InterventionRow } from '../types'
import { isOpen } from '../utils'
import { InterventionsTable } from './InterventionsTable'

/** Interventions d'un bien (onglet de la fiche) : à traiter d'abord, puis les plus récentes. */
export function PropertyInterventions({ rows }: { rows: InterventionRow[] }) {
  const { t } = useTranslation()
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
        <Wrench className="size-8 text-muted" strokeWidth={1.5} aria-hidden />
        <p className="text-sm text-muted">{t('maintenance.propertyEmpty')}</p>
      </div>
    )
  }
  const sorted = [...rows].sort(
    (a, b) =>
      Number(!isOpen(a.intervention.status)) - Number(!isOpen(b.intervention.status)) ||
      b.intervention.reportedAt.localeCompare(a.intervention.reportedAt),
  )
  return <InterventionsTable rows={sorted} hideProperty />
}

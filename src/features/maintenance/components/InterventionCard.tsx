import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { InterventionRow } from '../types'
import { categoryIcon } from '../visual'
import { MaintenanceStatusChip, PriorityBadge } from './Badges'
import { useLocationLabel } from '../hooks/useLocationLabel'
import { ScheduledDate } from './ScheduledDate'

/** Intervention en carte compacte (liste mobile). */
export function InterventionCard({ row }: { row: InterventionRow }) {
  const { t } = useTranslation()
  const location = useLocationLabel()
  const { intervention: i } = row
  const Icon = categoryIcon[i.category]

  return (
    <li className="min-w-0">
      <Link
        to={`/maintenance/${i.id}`}
        aria-label={t('maintenance.card.open', { title: i.title })}
        className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-surface outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-default text-default-foreground">
            <Icon className="size-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display">{i.title}</p>
            <p className="truncate text-xs text-muted">{location(row)}</p>
          </div>
          <MaintenanceStatusChip status={i.status} />
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <PriorityBadge priority={i.priority} />
          <ScheduledDate intervention={i} />
        </div>
      </Link>
    </li>
  )
}

import { Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useFormatters } from '@/lib/format'
import type { Intervention } from '../types'
import { isOverdue } from '../utils'

/** Date de passage prévue (ou de fin), signalée si elle est dépassée sans démarrage. */
export function ScheduledDate({ intervention: i }: { intervention: Intervention }) {
  const { t } = useTranslation()
  const f = useFormatters()
  const date = (iso: string) => f.dayMonthYear(new Date(`${iso}T12:00:00`))

  if (i.status === 'done' && i.completedAt) {
    return (
      <span className="text-muted tabular-nums">
        {t('maintenance.doneOn', { date: date(i.completedAt) })}
      </span>
    )
  }
  if (!i.scheduledAt || i.status === 'cancelled') return <span className="text-muted">—</span>
  return (
    <div>
      <p className="tabular-nums">{date(i.scheduledAt)}</p>
      {isOverdue(i) && (
        <p className="mt-0.5 flex items-center gap-1 text-xs text-warning-soft-foreground">
          <Clock className="size-3" aria-hidden />
          {t('maintenance.overdue')}
        </p>
      )}
    </div>
  )
}

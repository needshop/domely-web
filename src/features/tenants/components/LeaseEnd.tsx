import { Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useFormatters } from '@/lib/format'
import { daysUntil, isLeaseEndingSoon } from '../utils'

/** Date de fin de bail, signalée si elle approche. */
export function LeaseEnd({ date }: { date?: string }) {
  const { t } = useTranslation()
  const f = useFormatters()
  if (!date) return <span className="text-muted">—</span>

  const soon = isLeaseEndingSoon(date)
  return (
    <div>
      <p className="tabular-nums">{f.dayMonthYear(new Date(`${date}T12:00:00`))}</p>
      {soon && (
        <p className="mt-0.5 flex items-center gap-1 text-xs text-warning-soft-foreground">
          <Clock className="size-3" aria-hidden />
          {t('tenants.leaseEndsIn', { count: daysUntil(date) })}
        </p>
      )}
    </div>
  )
}

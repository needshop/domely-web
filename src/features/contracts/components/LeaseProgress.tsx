import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { daysUntil, todayIso } from '@/lib/dates'

/** Part de la période du bail déjà écoulée (0 → 1). */
function leaseProgress(start: string, end: string) {
  const total = daysUntil(end, start)
  if (total <= 0) return 1
  return Math.min(Math.max(daysUntil(todayIso(), start) / total, 0), 1)
}

/** Jauge fine de la durée écoulée du bail. */
export function LeaseProgress({
  start,
  end,
  className,
}: {
  start: string
  end: string
  className?: string
}) {
  const { t } = useTranslation()
  const progress = leaseProgress(start, end)
  return (
    <div
      role="meter"
      aria-label={t('contracts.elapsed')}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      className={cn('h-1 w-full overflow-hidden rounded-full bg-default', className)}
    >
      <div
        className="h-full rounded-full bg-night-700 dark:bg-night-200"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  )
}

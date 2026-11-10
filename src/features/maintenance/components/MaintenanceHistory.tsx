import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { useFormatters } from '@/lib/format'
import type { MaintenanceEvent } from '../types'
import { statusVisual } from '../visual'

/** Historique des étapes, de la plus récente à la plus ancienne. */
export function MaintenanceHistory({ events }: { events: MaintenanceEvent[] }) {
  const { t } = useTranslation()
  const f = useFormatters()
  const ordered = [...events].reverse()

  return (
    <ol className="flex flex-col">
      {ordered.map((e, index) => {
        const { icon: Icon } = statusVisual[e.status]
        const last = index === ordered.length - 1
        return (
          <li key={`${e.date}-${e.status}-${index}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full bg-default text-default-foreground',
                  index === 0 && 'bg-night-900 text-white dark:bg-white dark:text-night-900',
                )}
              >
                <Icon className="size-3.5" aria-hidden />
              </span>
              {!last && <span className="w-px flex-1 bg-separator" aria-hidden />}
            </div>
            <div className={cn('min-w-0 pb-4', last && 'pb-0')}>
              <p className="text-sm font-medium">{t(`maintenance.history.${e.status}`)}</p>
              <p className="text-xs text-muted tabular-nums">
                {f.dayMonthYear(new Date(`${e.date}T12:00:00`))}
              </p>
              {e.note && <p className="mt-1 text-sm">{e.note}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

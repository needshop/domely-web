import {
  CalendarClock,
  FileSignature,
  type LucideIcon,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { useFormatters } from '@/lib/format'
import { daysBetween } from '../utils'
import type { Deadline, DeadlineKind } from '../types'
import { SectionCard } from './SectionCard'

const kindIcon: Record<DeadlineKind, LucideIcon> = {
  leaseEnd: FileSignature,
  insurance: ShieldCheck,
  rentReview: TrendingUp,
  inspection: CalendarClock,
}

export function DeadlinesCard({ items, today }: { items: Deadline[]; today: Date }) {
  const { t } = useTranslation()
  const f = useFormatters()

  return (
    <SectionCard title={t('dashboard.deadlines.title')} href="/contracts">
      <ul className="flex flex-col">
        {items.map((d, i) => {
          const date = new Date(`${d.date}T12:00:00`)
          const inDays = daysBetween(today, date)
          const Icon = kindIcon[d.kind]
          const soon = inDays <= 14
          return (
            <li
              key={d.id}
              className={cn('flex items-center gap-3 py-3', i > 0 && 'border-t border-separator')}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-default text-default-foreground">
                <Icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {t(`dashboard.deadlines.kind.${d.kind}`)}
                </p>
                <p className="truncate text-xs text-muted">{d.property}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-medium tabular-nums">{f.dayMonth(date)}</p>
                <p className={cn('text-xs', soon ? 'text-warning-soft-foreground' : 'text-muted')}>
                  {t('dashboard.deadlines.in', { count: inDays })}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </SectionCard>
  )
}

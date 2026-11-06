import { Card } from '@heroui/react'
import { CircleCheck, CircleDashed, Hammer, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useFormatters } from '@/lib/format'
import type { Occupancy } from '../types'

export function OccupancyCard({ occupancy }: { occupancy: Occupancy }) {
  const { t } = useTranslation()
  const f = useFormatters()
  const total = occupancy.rented + occupancy.vacant + occupancy.underWorks
  const rate = total ? occupancy.rented / total : 0

  const rows: { key: keyof Occupancy; icon: LucideIcon; iconClass: string }[] = [
    { key: 'rented', icon: CircleCheck, iconClass: 'text-success-soft-foreground' },
    { key: 'vacant', icon: CircleDashed, iconClass: 'text-warning-soft-foreground' },
    { key: 'underWorks', icon: Hammer, iconClass: 'text-muted' },
  ]

  return (
    <Card className="gap-4 p-5">
      <Card.Header>
        <Card.Title className="font-display text-base">{t('dashboard.occupancy.title')}</Card.Title>
        <Card.Description>{t('dashboard.occupancy.subtitle', { count: total })}</Card.Description>
      </Card.Header>

      <Card.Content className="gap-5">
        <div>
          <p className="text-5xl font-semibold tracking-tight">{f.percent(rate)}</p>
          {/* Jauge : une seule couleur (statut « bon »), piste dans la même teinte, plus claire */}
          <div
            role="meter"
            aria-label={t('dashboard.occupancy.title')}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(rate * 100)}
            className="mt-3 h-2 w-full overflow-hidden rounded-full bg-brand-green-500/20"
          >
            <div
              className="h-full rounded-full bg-brand-green-500"
              style={{ width: `${rate * 100}%` }}
            />
          </div>
        </div>

        <ul className="flex flex-col gap-3">
          {rows.map(({ key, icon: Icon, iconClass }) => (
            <li key={key} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Icon className={`size-4 ${iconClass}`} aria-hidden />
                {t(`dashboard.occupancy.${key}`)}
              </span>
              <span className="font-semibold tabular-nums">{occupancy[key]}</span>
            </li>
          ))}
        </ul>
      </Card.Content>
    </Card>
  )
}

import { MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { cn } from '@/lib/cn'
import { useFormatters } from '@/lib/format'
import { propertyVisual } from '../propertyVisual'
import type { Property, PropertyStats } from '../types'
import { OccupancyBar } from './OccupancyBar'
import { PropertyAlerts } from './PropertyAlerts'

export function PropertyCard({ property: p, stats }: { property: Property; stats: PropertyStats }) {
  const { t } = useTranslation()
  const f = useFormatters()
  const { icon: Icon, gradient } = propertyVisual[p.type]

  return (
    <li>
      <Link
        to={`/properties/${p.id}`}
        aria-label={t('properties.card.open', { name: p.name })}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-surface transition-shadow outline-none hover:shadow-overlay focus-visible:ring-2 focus-visible:ring-focus"
      >
        {/* Visuel en attendant les photos des biens */}
        <div
          className={cn(
            'relative flex h-28 items-center justify-center bg-linear-to-br text-foreground/70',
            gradient,
          )}
        >
          <Icon
            className="size-10 transition-transform group-hover:scale-105"
            strokeWidth={1.5}
            aria-hidden
          />
          <span className="absolute top-3 left-3 rounded-full bg-surface/85 px-2.5 py-0.5 font-display text-xs text-foreground backdrop-blur">
            {t(`properties.type.${p.type}`)}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="min-w-0">
            <p className="truncate font-display text-base">{p.name}</p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">
                {p.address.district}, {p.address.city}
              </span>
            </p>
          </div>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between text-xs">
              <span>{t('properties.card.units', { count: stats.units })}</span>
              <span className="text-muted">
                {t('properties.card.occupied', { rented: stats.rented, total: stats.units })}
              </span>
            </div>
            <OccupancyBar rate={stats.occupancyRate} label={t('properties.table.occupancy')} />
          </div>

          <div className="mt-auto flex items-end justify-between gap-2">
            <p className="text-sm">
              <span className="font-semibold">{f.money(stats.monthlyRent)}</span>{' '}
              <span className="text-xs text-muted">{t('properties.card.perMonth')}</span>
            </p>
            <PropertyAlerts stats={stats} />
          </div>
        </div>
      </Link>
    </li>
  )
}

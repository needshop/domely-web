import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { propertyVisual } from '@/features/properties/propertyVisual'
import type { Property } from '@/features/properties/types'
import { propertyStats } from '@/features/properties/utils'
import { cn } from '@/lib/cn'
import { SectionCard } from './SectionCard'

export function RecentPropertiesCard({ items }: { items: Property[] }) {
  const { t } = useTranslation()

  return (
    <SectionCard title={t('dashboard.recentProperties.title')} href="/properties">
      <ul className="grid gap-4 sm:grid-cols-3">
        {items.map((p) => {
          const { icon: Icon, gradient } = propertyVisual[p.type]
          const stats = propertyStats(p)
          return (
            <li key={p.id}>
              <Link
                to={`/properties/${p.id}`}
                className="block overflow-hidden rounded-xl border border-border transition-shadow outline-none hover:shadow-overlay focus-visible:ring-2 focus-visible:ring-focus"
              >
                {/* Visuel en attendant les photos des biens */}
                <div
                  className={cn(
                    'flex h-24 items-center justify-center bg-linear-to-br text-foreground/70',
                    gradient,
                  )}
                >
                  <Icon className="size-9" strokeWidth={1.5} aria-hidden />
                </div>
                <div className="p-3">
                  <p className="truncate font-display text-sm">{p.name}</p>
                  <p className="truncate text-xs text-muted">
                    {t(`properties.type.${p.type}`)} · {p.address.city}
                  </p>
                  <p className="mt-2 text-xs">
                    <span>{t('dashboard.recentProperties.units', { count: stats.units })}</span>
                    <span className="text-muted">
                      {' · '}
                      {t('dashboard.recentProperties.occupied', {
                        occupied: stats.rented,
                        total: stats.units,
                      })}
                    </span>
                  </p>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </SectionCard>
  )
}

import { Building, Building2, House, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import type { PropertyType, RecentProperty } from '../types'
import { SectionCard } from './SectionCard'

const typeVisual: Record<PropertyType, { icon: LucideIcon; className: string }> = {
  residence: { icon: Building2, className: 'from-brand-red-500/20 to-brand-red-500/5' },
  house: { icon: House, className: 'from-brand-yellow-500/30 to-brand-yellow-500/5' },
  building: { icon: Building, className: 'from-brand-green-500/25 to-brand-green-500/5' },
}

export function RecentPropertiesCard({ items }: { items: RecentProperty[] }) {
  const { t } = useTranslation()

  return (
    <SectionCard title={t('dashboard.recentProperties.title')} href="/properties">
      <ul className="grid gap-4 sm:grid-cols-3">
        {items.map((p) => {
          const { icon: Icon, className } = typeVisual[p.type]
          return (
            <li key={p.id} className="overflow-hidden rounded-xl border border-border">
              {/* Visuel en attendant les photos des biens */}
              <div
                className={cn(
                  'flex h-24 items-center justify-center bg-linear-to-br text-foreground/70',
                  className,
                )}
              >
                <Icon className="size-9" strokeWidth={1.5} aria-hidden />
              </div>
              <div className="p-3">
                <p className="truncate font-display text-sm">{p.name}</p>
                <p className="truncate text-xs text-muted">
                  {t(`dashboard.recentProperties.type.${p.type}`)} · {p.city}
                </p>
                <p className="mt-2 text-xs">
                  <span>{t('dashboard.recentProperties.units', { count: p.units })}</span>
                  <span className="text-muted">
                    {' · '}
                    {t('dashboard.recentProperties.occupied', {
                      occupied: p.occupiedUnits,
                      total: p.units,
                    })}
                  </span>
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </SectionCard>
  )
}

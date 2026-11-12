import { buttonVariants } from '@heroui/react'
import { AlertTriangle, ChevronRight, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { OccupancyBar } from '@/features/properties/components/OccupancyBar'
import { propertyVisual } from '@/features/properties/propertyVisual'
import type { Property } from '@/features/properties/types'
import { propertyStats } from '@/features/properties/utils'
import { useCountryName } from '@/lib/countries'
import { cn } from '@/lib/cn'
import { useFormatters } from '@/lib/format'

/** Biens confiés par le bailleur, avec occupation et loyers ; ajout d'un bien pré-rempli. */
export function LandlordProperties({
  landlordId,
  properties,
}: {
  landlordId: string
  properties: Property[]
}) {
  const { t } = useTranslation()
  const f = useFormatters()
  const countryName = useCountryName()
  const addLink = (
    <Link
      to={`/properties/new?landlord=${landlordId}`}
      className={buttonVariants({ variant: 'secondary', size: 'sm' })}
    >
      <Plus className="size-4" aria-hidden />
      {t('landlords.detail.properties.add')}
    </Link>
  )

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-10 text-center">
        <p className="text-sm text-muted">{t('landlords.detail.properties.empty')}</p>
        {addLink}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="divide-y divide-separator">
        {properties.map((p) => {
          const stats = propertyStats(p)
          const { icon: Icon, gradient } = propertyVisual[p.type]
          return (
            <li key={p.id} className="min-w-0">
              <Link
                to={`/properties/${p.id}`}
                className="flex items-center gap-3 rounded-lg py-3 outline-none hover:bg-default-soft focus-visible:ring-2 focus-visible:ring-focus sm:px-2"
              >
                <span
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br text-foreground/70',
                    gradient,
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{p.name}</span>
                  <span className="block truncate text-xs text-muted">
                    {t(`properties.type.${p.type}`)} · {p.address.city},{' '}
                    {countryName(p.address.country)}
                  </span>
                </span>
                <span className="hidden w-32 shrink-0 flex-col gap-1 sm:flex">
                  <span className="text-xs text-muted">
                    {t('landlords.detail.properties.occupancy', {
                      rented: stats.rented,
                      units: stats.units,
                    })}
                  </span>
                  <OccupancyBar
                    rate={stats.occupancyRate}
                    label={t('landlords.detail.properties.occupancyLabel', { name: p.name })}
                  />
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-sm font-semibold tabular-nums">
                    {f.money(stats.monthlyRent)}
                  </span>
                  {stats.lateCount > 0 ? (
                    <span className="flex items-center justify-end gap-1 text-xs text-danger">
                      <AlertTriangle className="size-3" aria-hidden />
                      {t('landlords.detail.properties.late', { count: stats.lateCount })}
                    </span>
                  ) : (
                    <span className="block text-xs text-muted">{t('landlords.perMonth')}</span>
                  )}
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
              </Link>
            </li>
          )
        })}
      </ul>
      <div>{addLink}</div>
    </div>
  )
}

import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { useFormatters } from '@/lib/format'
import { propertyVisual } from '../propertyVisual'
import type { Property, PropertyStats } from '../types'
import { OccupancyBar } from './OccupancyBar'
import { PropertyAlerts } from './PropertyAlerts'

interface Row {
  property: Property
  stats: PropertyStats
}

export function PropertiesTable({ rows }: { rows: Row[] }) {
  const { t } = useTranslation()
  const f = useFormatters()
  const navigate = useNavigate()

  return (
    <div className="relative overflow-x-auto rounded-2xl border border-border bg-surface shadow-surface">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="text-xs text-muted">
          <tr className="border-b border-separator">
            <th className="px-4 py-3 font-normal">{t('properties.table.property')}</th>
            <th className="px-4 py-3 font-normal">{t('properties.table.type')}</th>
            <th className="px-4 py-3 text-right font-normal">{t('properties.table.units')}</th>
            <th className="w-40 px-4 py-3 font-normal">{t('properties.table.occupancy')}</th>
            <th className="px-4 py-3 text-right font-normal">{t('properties.table.rent')}</th>
            <th className="px-4 py-3 font-normal">{t('properties.table.alerts')}</th>
            <th className="w-10 px-4 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ property: p, stats }) => {
            const { icon: Icon } = propertyVisual[p.type]
            const href = `/properties/${p.id}`
            return (
              <tr
                key={p.id}
                onClick={() => void navigate(href)}
                className="cursor-pointer border-b border-separator transition-colors last:border-0 hover:bg-default-soft"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-default text-default-foreground">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      {/* Le lien porte la navigation clavier / lecteur d'écran ; la ligne entière est cliquable */}
                      <Link
                        to={href}
                        onClick={(e) => e.stopPropagation()}
                        className="truncate font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-focus"
                      >
                        {p.name}
                      </Link>
                      <p className="truncate text-xs text-muted">
                        {p.address.district}, {p.address.city}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{t(`properties.type.${p.type}`)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{stats.units}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <OccupancyBar
                      rate={stats.occupancyRate}
                      label={t('properties.table.occupancy')}
                      className="flex-1"
                    />
                    <span className="w-10 text-right text-xs tabular-nums">
                      {f.percent(stats.occupancyRate)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums">
                  {f.money(stats.monthlyRent)}
                </td>
                <td className="px-4 py-3">
                  <PropertyAlerts stats={stats} />
                </td>
                <td className="px-4 py-3 text-muted">
                  <ChevronRight className="size-4" aria-hidden />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

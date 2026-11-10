import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { useFormatters } from '@/lib/format'
import type { InterventionRow } from '../types'
import { categoryIcon } from '../visual'
import { MaintenanceStatusChip, PriorityBadge } from './Badges'
import { ScheduledDate } from './ScheduledDate'

export function InterventionsTable({
  rows,
  hideProperty,
}: {
  rows: InterventionRow[]
  /** Fiche d'un bien : le nom du bien est inutile */
  hideProperty?: boolean
}) {
  const { t } = useTranslation()
  const f = useFormatters()
  const navigate = useNavigate()

  return (
    <div className="relative overflow-x-auto rounded-2xl border border-border bg-surface shadow-surface">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="text-xs text-muted">
          <tr className="border-b border-separator">
            <th className="px-4 py-3 font-normal">{t('maintenance.table.intervention')}</th>
            <th className="px-4 py-3 font-normal">{t('maintenance.table.location')}</th>
            <th className="px-4 py-3 font-normal">{t('maintenance.table.priority')}</th>
            <th className="px-4 py-3 font-normal">{t('maintenance.table.reportedAt')}</th>
            <th className="px-4 py-3 font-normal">{t('maintenance.table.scheduledAt')}</th>
            <th className="px-4 py-3 font-normal">{t('maintenance.table.status')}</th>
            <th className="w-10 px-4 py-3">
              <span className="sr-only">{t('maintenance.table.actions')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const { intervention: i } = row
            const Icon = categoryIcon[i.category]
            const href = `/maintenance/${i.id}`
            return (
              <tr
                key={i.id}
                onClick={() => void navigate(href)}
                className="cursor-pointer border-b border-separator transition-colors last:border-0 hover:bg-default-soft"
              >
                <td className="max-w-80 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-default text-default-foreground">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      {/* Le lien porte la navigation clavier / lecteur d'écran ; la ligne entière est cliquable */}
                      <Link
                        to={href}
                        onClick={(e) => e.stopPropagation()}
                        className="block truncate font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-focus"
                      >
                        {i.title}
                      </Link>
                      <p className="truncate text-xs text-muted">
                        {i.reference} · {t(`maintenance.category.${i.category}`)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="max-w-60 px-4 py-3">
                  {!hideProperty && <p className="truncate">{row.property?.name ?? '—'}</p>}
                  <p className={hideProperty ? 'truncate' : 'truncate text-xs text-muted'}>
                    {row.unit?.label ?? t('maintenance.commonAreas')}
                    {row.tenant && ` · ${row.tenant.name}`}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={i.priority} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                  {f.dayMonthYear(new Date(`${i.reportedAt}T12:00:00`))}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <ScheduledDate intervention={i} />
                </td>
                <td className="px-4 py-3">
                  <MaintenanceStatusChip status={i.status} />
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

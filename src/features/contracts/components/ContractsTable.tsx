import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { useFormatters } from '@/lib/format'
import type { LeaseRow } from '../types'
import { LeaseEnd } from './LeaseEnd'
import { LeaseTenantCell } from './LeaseParties'
import { LeaseProgress } from './LeaseProgress'
import { LeaseStatusChip } from './LeaseStatusChip'

export function ContractsTable({ rows }: { rows: LeaseRow[] }) {
  const { t } = useTranslation()
  const f = useFormatters()
  const navigate = useNavigate()
  const date = (iso: string) => f.dayMonthYear(new Date(`${iso}T12:00:00`))

  return (
    <div className="relative overflow-x-auto rounded-2xl border border-border bg-surface shadow-surface">
      <table className="w-full min-w-[880px] text-left text-sm">
        <thead className="text-xs text-muted">
          <tr className="border-b border-separator">
            <th className="px-4 py-3 font-normal">{t('contracts.table.reference')}</th>
            <th className="px-4 py-3 font-normal">{t('contracts.table.parties')}</th>
            <th className="px-4 py-3 font-normal">{t('contracts.table.start')}</th>
            <th className="w-44 px-4 py-3 font-normal">{t('contracts.table.end')}</th>
            <th className="px-4 py-3 text-right font-normal">{t('contracts.table.rent')}</th>
            <th className="px-4 py-3 font-normal">{t('contracts.table.status')}</th>
            <th className="w-10 px-4 py-3">
              <span className="sr-only">{t('contracts.table.actions')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const { lease } = row
            const href = `/contracts/${lease.id}`
            return (
              <tr
                key={lease.id}
                onClick={() => void navigate(href)}
                className="cursor-pointer border-b border-separator transition-colors last:border-0 hover:bg-default-soft"
              >
                <td className="px-4 py-3">
                  {/* Le lien porte la navigation clavier / lecteur d'écran ; la ligne entière est cliquable */}
                  <Link
                    to={href}
                    onClick={(e) => e.stopPropagation()}
                    className="font-medium whitespace-nowrap tabular-nums outline-none hover:underline focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    {lease.reference}
                  </Link>
                  <p className="text-xs text-muted">{t(`contracts.type.${lease.type}`)}</p>
                </td>
                <td className="max-w-64 px-4 py-3">
                  <LeaseTenantCell row={row} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                  {date(lease.startDate)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {row.status === 'terminated' && lease.terminatedAt ? (
                    <p className="text-muted tabular-nums">
                      {t('contracts.terminatedOn', { date: date(lease.terminatedAt) })}
                    </p>
                  ) : (
                    <>
                      <LeaseEnd date={lease.endDate} />
                      {row.status === 'active' && (
                        <LeaseProgress
                          start={lease.startDate}
                          end={lease.endDate}
                          className="mt-1.5"
                        />
                      )}
                    </>
                  )}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <p className="font-semibold tabular-nums">{f.money(lease.rent)}</p>
                  <p className="text-xs text-muted tabular-nums">
                    {t('properties.detail.units.charges', { amount: f.money(lease.charges) })}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <LeaseStatusChip status={row.status} />
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

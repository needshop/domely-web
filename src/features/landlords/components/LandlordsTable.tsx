import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { useFormatters } from '@/lib/format'
import type { LandlordRow } from '../types'
import { LandlordAvatar } from './LandlordAvatar'
import { LandlordPortfolio } from './LandlordPortfolio'

export function LandlordsTable({ rows }: { rows: LandlordRow[] }) {
  const { t } = useTranslation()
  const f = useFormatters()
  const navigate = useNavigate()

  return (
    <div className="relative overflow-x-auto rounded-2xl border border-border bg-surface shadow-surface">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="text-xs text-muted">
          <tr className="border-b border-separator">
            <th className="px-4 py-3 font-normal">{t('landlords.table.landlord')}</th>
            <th className="px-4 py-3 font-normal">{t('landlords.table.contact')}</th>
            <th className="px-4 py-3 font-normal">{t('landlords.table.properties')}</th>
            <th className="px-4 py-3 text-right font-normal">{t('landlords.table.occupancy')}</th>
            <th className="px-4 py-3 text-right font-normal">{t('landlords.table.rent')}</th>
            <th className="px-4 py-3 text-right font-normal">{t('landlords.table.fees')}</th>
            <th className="w-10 px-4 py-3">
              <span className="sr-only">{t('landlords.table.actions')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const { landlord } = row
            const href = `/landlords/${landlord.id}`
            const hasProperties = row.properties.length > 0
            return (
              <tr
                key={landlord.id}
                onClick={() => void navigate(href)}
                className="cursor-pointer border-b border-separator transition-colors last:border-0 hover:bg-default-soft"
              >
                <td className="max-w-64 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <LandlordAvatar landlord={landlord} size="sm" />
                    <div className="min-w-0">
                      {/* Le lien porte la navigation clavier / lecteur d'écran ; la ligne entière est cliquable */}
                      <Link
                        to={href}
                        onClick={(e) => e.stopPropagation()}
                        className="block truncate font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-focus"
                      >
                        {landlord.name}
                      </Link>
                      <p className="truncate text-xs text-muted">
                        {landlord.contactPerson ?? t(`landlords.kind.${landlord.kind}`)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="max-w-56 px-4 py-3">
                  <p className="whitespace-nowrap tabular-nums">{landlord.phone}</p>
                  <p className="truncate text-xs text-muted">{landlord.email}</p>
                </td>
                <td className="max-w-60 px-4 py-3">
                  <LandlordPortfolio row={row} />
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums">
                  {hasProperties ? f.percent(row.occupancyRate) : '—'}
                </td>
                <td className="px-4 py-3 text-right font-semibold whitespace-nowrap tabular-nums">
                  {hasProperties ? f.money(row.monthlyRent) : '—'}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums">
                  {row.monthlyFees ? f.money(row.monthlyFees) : '—'}
                  {landlord.feeRate !== undefined && (
                    <span className="block text-xs text-muted">
                      {t('landlords.feeRateShort', { rate: f.number(landlord.feeRate) })}
                    </span>
                  )}
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

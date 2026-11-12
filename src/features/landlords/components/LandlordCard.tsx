import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useFormatters } from '@/lib/format'
import type { LandlordRow } from '../types'
import { LandlordAvatar } from './LandlordAvatar'
import { LandlordPortfolio } from './LandlordPortfolio'

/** Bailleur en carte compacte (liste mobile). */
export function LandlordCard({ row }: { row: LandlordRow }) {
  const { t } = useTranslation()
  const f = useFormatters()
  const { landlord } = row

  return (
    <li className="min-w-0">
      <Link
        to={`/landlords/${landlord.id}`}
        aria-label={t('landlords.card.open', { name: landlord.name })}
        className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-surface outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <div className="flex items-start gap-3">
          <LandlordAvatar landlord={landlord} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display">{landlord.name}</p>
            <p className="truncate text-xs text-muted tabular-nums">{landlord.phone}</p>
          </div>
        </div>
        <div className="flex items-end justify-between gap-3">
          <LandlordPortfolio row={row} />
          {row.monthlyRent > 0 && (
            <p className="shrink-0 text-right text-sm">
              <span className="font-semibold tabular-nums">{f.money(row.monthlyRent)}</span>
              <span className="block text-xs text-muted">{t('landlords.perMonth')}</span>
            </p>
          )}
        </div>
      </Link>
    </li>
  )
}

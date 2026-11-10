import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useFormatters } from '@/lib/format'
import type { LeaseRow } from '../types'
import { LeaseTenantCell } from './LeaseParties'
import { LeaseStatusChip } from './LeaseStatusChip'

/** Contrat en carte compacte (liste mobile). */
export function ContractCard({ row }: { row: LeaseRow }) {
  const { t } = useTranslation()
  const f = useFormatters()
  const { lease } = row
  const date = (iso: string) => f.dayMonthYear(new Date(`${iso}T12:00:00`))

  return (
    <li>
      <Link
        to={`/contracts/${lease.id}`}
        aria-label={t('contracts.card.open', { reference: lease.reference })}
        className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-surface outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display tabular-nums">{lease.reference}</p>
            <p className="text-xs text-muted tabular-nums">
              {date(lease.startDate)} → {date(lease.terminatedAt ?? lease.endDate)}
            </p>
          </div>
          <LeaseStatusChip status={row.status} />
        </div>
        <div className="flex items-end justify-between gap-3 text-sm">
          <LeaseTenantCell row={row} />
          <p className="shrink-0 text-right">
            <span className="font-semibold tabular-nums">
              {f.money(lease.rent + lease.charges)}
            </span>
            <span className="block text-xs text-muted">{t('tenants.perMonth')}</span>
          </p>
        </div>
      </Link>
    </li>
  )
}

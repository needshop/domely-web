import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useFormatters } from '@/lib/format'
import type { RentDueRow } from '../types'
import { LastReminder, RowAction } from './RentsTable'
import { RentStatusChip } from './RentStatusChip'

/** Échéance en carte compacte (liste mobile). */
export function RentCard({
  row,
  action,
  onAction,
}: {
  row: RentDueRow
  action: 'collect' | 'remind'
  onAction: (row: RentDueRow) => void
}) {
  const { t } = useTranslation()
  const f = useFormatters()
  const { due, lease, tenant } = row

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-surface">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to={`/contracts/${lease.id}`}
            className="block truncate font-display outline-none hover:underline focus-visible:ring-2 focus-visible:ring-focus"
          >
            {tenant?.name ?? t('contracts.unknownTenant')}
          </Link>
          <p className="truncate text-xs text-muted">
            {row.property?.name ?? '—'} · {row.unit?.label ?? '—'}
          </p>
        </div>
        <div>
          <RentStatusChip status={due.status} daysLate={due.daysLate} />
          <LastReminder row={row} />
        </div>
      </div>
      <div className="flex items-end justify-between gap-3 text-sm">
        <div>
          <p className="text-xs text-muted">
            {t('rents.dueOn', { date: f.dayMonthYear(new Date(`${due.dueDate}T12:00:00`)) })}
          </p>
          <p className="font-semibold tabular-nums">
            {due.remaining ? f.money(due.remaining) : f.money(due.amount)}
          </p>
          {due.remaining > 0 && due.paid > 0 && (
            <p className="text-xs text-muted tabular-nums">
              {t('rents.paidOf', { paid: f.money(due.paid), amount: f.money(due.amount) })}
            </p>
          )}
        </div>
        {due.remaining > 0 && <RowAction row={row} action={action} onAction={onAction} />}
      </div>
    </li>
  )
}

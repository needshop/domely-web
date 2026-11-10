import { Button } from '@heroui/react'
import { BellRing, HandCoins } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useFormatters } from '@/lib/format'
import type { RentDueRow } from '../types'
import { RentStatusChip } from './RentStatusChip'

interface RentsTableProps {
  rows: RentDueRow[]
  /** Affiche le mois de l'échéance (vue « Impayés », tous mois confondus) */
  showPeriod?: boolean
  /** Action de ligne : encaisser (vue du mois) ou relancer (vue « Impayés ») */
  action: 'collect' | 'remind'
  onAction: (row: RentDueRow) => void
}

export function RentsTable({ rows, showPeriod, action, onAction }: RentsTableProps) {
  const { t } = useTranslation()
  const f = useFormatters()
  const date = (iso: string) => f.dayMonthYear(new Date(`${iso}T12:00:00`))

  return (
    <div className="relative overflow-x-auto rounded-2xl border border-border bg-surface shadow-surface">
      <table className="w-full min-w-[880px] text-left text-sm">
        <thead className="text-xs text-muted">
          <tr className="border-b border-separator">
            <th className="px-4 py-3 font-normal">{t('rents.table.tenant')}</th>
            <th className="px-4 py-3 font-normal">
              {showPeriod ? t('rents.table.period') : t('rents.table.dueDate')}
            </th>
            <th className="px-4 py-3 text-right font-normal">{t('rents.table.amount')}</th>
            <th className="px-4 py-3 text-right font-normal">{t('rents.table.paid')}</th>
            <th className="px-4 py-3 text-right font-normal">{t('rents.table.remaining')}</th>
            <th className="px-4 py-3 font-normal">{t('rents.table.status')}</th>
            <th className="px-4 py-3">
              <span className="sr-only">{t('rents.table.actions')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const { due, lease, tenant } = row
            return (
              <tr key={due.id} className="border-b border-separator last:border-0">
                <td className="max-w-72 px-4 py-3">
                  <Link
                    to={`/contracts/${lease.id}`}
                    className="block truncate font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    {tenant?.name ?? t('contracts.unknownTenant')}
                  </Link>
                  <p className="truncate text-xs text-muted">
                    {row.property?.name ?? '—'} · {row.unit?.label ?? '—'}
                  </p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {showPeriod && (
                    <p className="capitalize">
                      {f.monthLong(new Date(`${due.period}-15T12:00:00`))}
                    </p>
                  )}
                  <p className={showPeriod ? 'text-xs text-muted tabular-nums' : 'tabular-nums'}>
                    {date(due.dueDate)}
                  </p>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums">
                  {f.money(due.amount)}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums">
                  {due.paid ? f.money(due.paid) : <span className="text-muted">—</span>}
                  {due.payments.length > 0 && (
                    <p className="text-xs text-muted">
                      {t(`rents.method.${due.payments[due.payments.length - 1].method}`)}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-semibold whitespace-nowrap tabular-nums">
                  {due.remaining ? f.money(due.remaining) : <span className="text-muted">—</span>}
                </td>
                <td className="px-4 py-3">
                  <RentStatusChip status={due.status} daysLate={due.daysLate} />
                  <LastReminder row={row} />
                </td>
                <td className="px-4 py-3 text-right">
                  {due.remaining > 0 && <RowAction row={row} action={action} onAction={onAction} />}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/** Bouton d'action d'une échéance non soldée. */
export function RowAction({
  row,
  action,
  onAction,
}: {
  row: RentDueRow
  action: 'collect' | 'remind'
  onAction: (row: RentDueRow) => void
}) {
  const { t } = useTranslation()
  const name = row.tenant?.name ?? ''
  const Icon = action === 'remind' ? BellRing : HandCoins
  return (
    <Button
      size="sm"
      variant="secondary"
      onPress={() => onAction(row)}
      aria-label={
        action === 'remind'
          ? t('rents.remindLabel', { tenant: name })
          : t('rents.collectLabel', { tenant: name })
      }
    >
      <Icon className="size-3.5" aria-hidden />
      {action === 'remind' ? t('rents.remind') : t('rents.collect')}
    </Button>
  )
}

/** « Relancé le … » sous la situation, si une relance a été envoyée. */
export function LastReminder({ row }: { row: RentDueRow }) {
  const { t } = useTranslation()
  const f = useFormatters()
  if (!row.lastReminder || row.due.remaining === 0) return null
  return (
    <p className="mt-0.5 text-xs text-muted">
      {t('rents.reminder.sentOn', {
        date: f.dayMonthYear(new Date(`${row.lastReminder.date}T12:00:00`)),
      })}
    </p>
  )
}

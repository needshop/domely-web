import { Button, Card } from '@heroui/react'
import { HandCoins } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFormatters } from '@/lib/format'
import { useRentDues } from '../api'
import type { RentDueRow } from '../types'
import { RecordPaymentModal } from './RecordPaymentModal'
import { RentStatusChip } from './RentStatusChip'

/** Nombre de mois affichés avant « Afficher tout ». */
const VISIBLE = 6

/** Historique des loyers d'un contrat, du plus récent au plus ancien. */
export function LeaseRentHistory({ leaseId }: { leaseId: string }) {
  const { t } = useTranslation()
  const f = useFormatters()
  const all = useRentDues()
  const rows = useMemo(
    () =>
      all
        .filter((r) => r.due.leaseId === leaseId)
        .sort((a, b) => b.due.period.localeCompare(a.due.period)),
    [all, leaseId],
  )
  const [expanded, setExpanded] = useState(false)
  const [collecting, setCollecting] = useState<RentDueRow | null>(null)
  const visible = expanded ? rows : rows.slice(0, VISIBLE)
  const overdue = rows.filter((r) => r.due.status === 'late' || r.due.status === 'partial')
  const date = (iso: string) => f.dayMonthYear(new Date(`${iso}T12:00:00`))

  return (
    <Card className="gap-2 p-5">
      <Card.Header className="flex-row flex-wrap items-baseline justify-between gap-2">
        <Card.Title className="font-display text-base">{t('rents.history.title')}</Card.Title>
        <Card.Description>
          {overdue.length === 0
            ? t('rents.history.upToDate')
            : t('rents.history.overdue', {
                count: overdue.length,
                amount: f.money(overdue.reduce((s, r) => s + r.due.remaining, 0)),
              })}
        </Card.Description>
      </Card.Header>
      <Card.Content>
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">{t('rents.history.empty')}</p>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs text-muted">
                <tr className="border-b border-separator">
                  <th className="py-2.5 pr-3 font-normal">{t('rents.table.period')}</th>
                  <th className="px-3 py-2.5 text-right font-normal">{t('rents.table.amount')}</th>
                  <th className="px-3 py-2.5 font-normal">{t('rents.history.payments')}</th>
                  <th className="px-3 py-2.5 font-normal">{t('rents.table.status')}</th>
                  <th className="py-2.5 pl-3">
                    <span className="sr-only">{t('rents.table.actions')}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => {
                  const { due } = row
                  return (
                    <tr key={due.id} className="border-b border-separator last:border-0">
                      <td className="py-3 pr-3">
                        <p className="capitalize">
                          {f.monthLong(new Date(`${due.period}-15T12:00:00`))}
                        </p>
                        <p className="text-xs text-muted tabular-nums">
                          {t('rents.dueOn', { date: date(due.dueDate) })}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-right whitespace-nowrap tabular-nums">
                        {f.money(due.amount)}
                      </td>
                      <td className="px-3 py-3 text-xs">
                        {due.payments.length === 0 ? (
                          <span className="text-muted">—</span>
                        ) : (
                          <ul className="flex flex-col gap-0.5">
                            {due.payments.map((p) => (
                              <li key={p.id} className="tabular-nums">
                                {f.money(p.amount)}{' '}
                                <span className="text-muted">
                                  · {date(p.date)} · {t(`rents.method.${p.method}`)}
                                  {p.reference && ` · ${p.reference}`}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <RentStatusChip status={due.status} daysLate={due.daysLate} />
                      </td>
                      <td className="py-3 pl-3 text-right">
                        {due.remaining > 0 && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onPress={() => setCollecting(row)}
                            aria-label={t('rents.collectPeriodLabel', {
                              month: f.monthLong(new Date(`${due.period}-15T12:00:00`)),
                            })}
                          >
                            <HandCoins className="size-3.5" aria-hidden />
                            {t('rents.collect')}
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {rows.length > VISIBLE && (
          <Button size="sm" variant="ghost" className="mt-2" onPress={() => setExpanded((e) => !e)}>
            {expanded
              ? t('rents.history.showLess')
              : t('rents.history.showAll', { count: rows.length })}
          </Button>
        )}
      </Card.Content>
      <RecordPaymentModal row={collecting} onClose={() => setCollecting(null)} />
    </Card>
  )
}

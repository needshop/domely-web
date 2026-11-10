import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { cn } from '@/lib/cn'
import { useFormatters } from '@/lib/format'
import { performanceTotals, type PropertyPerformance } from '../utils'

/** Performance par bien : attendu, encaissé, recouvrement, impayés, dépenses et résultat net. */
export function PropertyPerformanceTable({ rows }: { rows: PropertyPerformance[] }) {
  const { t } = useTranslation()
  const f = useFormatters()
  const totals = performanceTotals(rows)
  const num = 'px-3 py-3 text-right whitespace-nowrap tabular-nums'

  return (
    <div className="relative -mx-1 overflow-x-auto">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead className="text-xs text-muted">
          <tr className="border-b border-separator">
            <th className="px-3 py-2.5 font-normal">{t('reports.table.property')}</th>
            <th className="px-3 py-2.5 text-right font-normal">{t('reports.table.occupancy')}</th>
            <th className="px-3 py-2.5 text-right font-normal">{t('reports.table.expected')}</th>
            <th className="px-3 py-2.5 text-right font-normal">{t('reports.table.collected')}</th>
            <th className="px-3 py-2.5 text-right font-normal">{t('reports.table.rate')}</th>
            <th className="px-3 py-2.5 text-right font-normal">{t('reports.table.overdue')}</th>
            <th className="px-3 py-2.5 text-right font-normal">{t('reports.table.expenses')}</th>
            <th className="px-3 py-2.5 text-right font-normal">{t('reports.table.net')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.property.id} className="border-b border-separator">
              <td className="px-3 py-3">
                <Link
                  to={`/properties/${r.property.id}`}
                  className="font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-focus"
                >
                  {r.property.name}
                </Link>
                <p className="text-xs text-muted">
                  {t('properties.card.units', { count: r.units })} · {r.property.address.city}
                </p>
              </td>
              <td className={num}>{f.percent(r.occupancyRate)}</td>
              <td className={num}>{f.money(r.expected)}</td>
              <td className={num}>{f.money(r.collected)}</td>
              <td className={num}>{r.expected ? f.percent(r.rate) : '—'}</td>
              <td className={cn(num, r.overdue > 0 && 'text-danger')}>
                {r.overdue ? f.money(r.overdue) : '—'}
              </td>
              <td className={num}>{r.expenses ? f.money(r.expenses) : '—'}</td>
              <td className={cn(num, 'font-semibold')}>{f.money(r.net)}</td>
            </tr>
          ))}
        </tbody>
        {rows.length > 1 && (
          <tfoot>
            <tr className="font-semibold">
              <td className="px-3 py-3">{t('reports.table.total')}</td>
              <td className={num} />
              <td className={num}>{f.money(totals.expected)}</td>
              <td className={num}>{f.money(totals.collected)}</td>
              <td className={num}>{f.percent(totals.rate)}</td>
              <td className={cn(num, totals.overdue > 0 && 'text-danger')}>
                {totals.overdue ? f.money(totals.overdue) : '—'}
              </td>
              <td className={num}>{f.money(totals.expenses)}</td>
              <td className={num}>{f.money(totals.net)}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}

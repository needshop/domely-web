import { Chip } from '@heroui/react'
import { CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { cn } from '@/lib/cn'
import { useFormatters } from '@/lib/format'
import type { Debtor } from '../utils'

/** Locataires qui doivent le plus, avec l'ancienneté de leur plus vieil impayé. */
export function DebtorsList({ debtors }: { debtors: Debtor[] }) {
  const { t } = useTranslation()
  const f = useFormatters()
  if (debtors.length === 0) {
    return (
      <p className="flex items-center justify-center gap-2 py-6 text-sm text-muted">
        <CheckCircle2 className="size-4 text-success" aria-hidden />
        {t('reports.debtors.none')}
      </p>
    )
  }
  return (
    <ul className="flex flex-col">
      {debtors.map((d, i) => (
        <li
          key={d.tenantId}
          className={cn('flex items-center gap-3 py-3', i > 0 && 'border-t border-separator')}
        >
          <div className="min-w-0 flex-1">
            <Link
              to={`/contracts/${d.leaseId}`}
              className="block truncate text-sm font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-focus"
            >
              {d.name}
            </Link>
            <p className="truncate text-xs text-muted">
              {d.location} · {t('reports.debtors.dues', { count: d.count })}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-semibold tabular-nums">{f.money(d.amount)}</p>
            <Chip size="sm" variant="soft" color={d.oldestDays > 60 ? 'danger' : 'warning'}>
              {t('rents.daysLate', { count: d.oldestDays })}
            </Chip>
          </div>
        </li>
      ))}
    </ul>
  )
}

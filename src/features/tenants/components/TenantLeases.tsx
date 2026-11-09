import { Chip } from '@heroui/react'
import { AlertTriangle, ChevronRight, FileX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { propertyVisual } from '@/features/properties/propertyVisual'
import { useFormatters } from '@/lib/format'
import type { TenantLease } from '../types'
import { daysUntil, todayIso } from '../utils'
import { LeaseEnd } from './LeaseEnd'

/** Part du bail déjà écoulée (0 → 1). */
function leaseProgress(start: string, end: string) {
  const total = daysUntil(end, start)
  if (total <= 0) return 1
  return Math.min(Math.max(daysUntil(todayIso(), start) / total, 0), 1)
}

/** Baux en cours du locataire : lot, bien, loyer et période. */
export function TenantLeases({ leases }: { leases: TenantLease[] }) {
  const { t } = useTranslation()
  const f = useFormatters()
  const date = (iso: string) => f.dayMonthYear(new Date(`${iso}T12:00:00`))

  if (leases.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
        <FileX className="size-8 text-muted" strokeWidth={1.5} aria-hidden />
        <p className="font-display">{t('tenants.detail.leases.emptyTitle')}</p>
        <p className="max-w-sm text-sm text-muted">{t('tenants.detail.leases.emptyDescription')}</p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-separator">
      {leases.map(({ property, unit, lease }) => {
        const { icon: Icon } = propertyVisual[property.type]
        const progress = leaseProgress(lease.startDate, lease.endDate)
        return (
          <li key={unit.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-default text-default-foreground">
                <Icon className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <Link
                  to={`/properties/${property.id}`}
                  className="group flex items-center gap-1 font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <span className="truncate">{property.name}</span>
                  <ChevronRight className="size-3.5 shrink-0 text-muted" aria-hidden />
                </Link>
                <p className="truncate text-xs text-muted">
                  {unit.label} · {t(`properties.unitKind.${unit.kind}`)} · {property.address.city}
                </p>
                {unit.isLate && (
                  <Chip size="sm" variant="soft" color="danger" className="mt-1.5">
                    <AlertTriangle className="size-3.5" aria-hidden />
                    {t('tenants.status.late')}
                  </Chip>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm sm:w-[26rem] sm:shrink-0">
              <div>
                <p className="text-xs text-muted">{t('tenants.detail.leases.rent')}</p>
                <p className="font-semibold tabular-nums">{f.money(unit.rent)}</p>
                <p className="text-xs text-muted tabular-nums">
                  {t('properties.detail.units.charges', { amount: f.money(unit.charges) })}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">{t('tenants.detail.leases.period')}</p>
                <p className="text-xs text-muted tabular-nums">
                  {t('tenants.detail.leases.since', { date: date(lease.startDate) })}
                </p>
                <LeaseEnd date={lease.endDate} />
                <div
                  role="meter"
                  aria-label={t('tenants.detail.leases.elapsed')}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress * 100)}
                  className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-default"
                >
                  <div
                    className="h-full rounded-full bg-night-700 dark:bg-night-200"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

import { Chip } from '@heroui/react'
import { AlertTriangle, ChevronRight, FileText, FileX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { propertyVisual } from '@/features/properties/propertyVisual'
import { useFormatters } from '@/lib/format'
import type { TenantLease } from '../types'
import { LeaseEnd } from '@/features/contracts/components/LeaseEnd'
import { LeaseProgress } from '@/features/contracts/components/LeaseProgress'

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
                <Link
                  to={`/contracts/${lease.id}`}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-accent outline-none hover:underline focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <FileText className="size-3.5" aria-hidden />
                  {t('tenants.detail.leases.viewContract')}
                </Link>
                {unit.isLate && (
                  <Chip size="sm" variant="soft" color="danger" className="mt-1.5 flex w-fit">
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
                <LeaseProgress start={lease.startDate} end={lease.endDate} className="mt-1.5" />
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

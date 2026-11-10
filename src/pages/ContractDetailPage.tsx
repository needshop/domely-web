import { Breadcrumbs, Button, buttonVariants, Card, Chip } from '@heroui/react'
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  CircleSlash,
  Info,
  Pencil,
  PiggyBank,
  Wallet,
} from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { StatTile } from '@/components/StatTile'
import { useLeaseRow } from '@/features/contracts/api'
import { LeaseProgress } from '@/features/contracts/components/LeaseProgress'
import { LeaseStatusChip } from '@/features/contracts/components/LeaseStatusChip'
import { TerminateLeaseModal } from '@/features/contracts/components/TerminateLeaseModal'
import { propertyVisual } from '@/features/properties/propertyVisual'
import { TenantAvatar } from '@/features/tenants/components/TenantAvatar'
import { cn } from '@/lib/cn'
import { daysUntil, durationInMonths } from '@/lib/dates'
import { useFormatters } from '@/lib/format'

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:gap-6">
      <dt className="text-sm text-muted sm:w-52 sm:shrink-0">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  )
}

function Notice({
  tone,
  icon: Icon,
  children,
}: {
  tone: 'warning' | 'default'
  icon: typeof Info
  children: ReactNode
}) {
  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-2 rounded-xl px-4 py-3 text-sm',
        tone === 'warning' && 'bg-warning-soft text-warning-soft-foreground',
        tone === 'default' && 'bg-default text-default-foreground',
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>{children}</p>
    </div>
  )
}

export function ContractDetailPage() {
  const { t } = useTranslation()
  const f = useFormatters()
  const { id } = useParams()
  const row = useLeaseRow(id)
  const [terminating, setTerminating] = useState(false)

  if (!row) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 py-16 text-center">
        <p className="font-display text-lg">{t('contracts.detail.notFound')}</p>
        <Link to="/contracts" className={buttonVariants({ variant: 'secondary' })}>
          <ArrowLeft className="size-4" aria-hidden />
          {t('contracts.detail.back')}
        </Link>
      </div>
    )
  }

  const { lease, status, property, unit, tenant } = row
  const date = (iso: string) => f.dayMonthYear(new Date(`${iso}T12:00:00`))
  const months = durationInMonths(lease.startDate, lease.endDate)
  const isClosed = status === 'terminated'
  const plannedTermination = !isClosed && lease.terminatedAt
  const PropertyIcon = property ? propertyVisual[property.type].icon : null
  const daysLeft = daysUntil(lease.endDate)

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <Breadcrumbs>
        <Breadcrumbs.Item href="/contracts">{t('contracts.title')}</Breadcrumbs.Item>
        <Breadcrumbs.Item>{lease.reference}</Breadcrumbs.Item>
      </Breadcrumbs>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl tabular-nums">{lease.reference}</h1>
            <Chip size="sm" variant="soft">
              {t(`contracts.type.${lease.type}`)}
            </Chip>
            <LeaseStatusChip status={status} />
          </div>
          <p className="mt-1 text-sm text-muted">
            {t('contracts.detail.subtitle', {
              tenant: tenant?.name ?? t('contracts.unknownTenant'),
              unit: unit?.label ?? '—',
              property: property?.name ?? '—',
            })}
          </p>
        </div>
        {!isClosed && (
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/contracts/${lease.id}/edit`}
              className={buttonVariants({ variant: 'secondary' })}
            >
              <Pencil className="size-4" aria-hidden />
              {t('contracts.detail.edit')}
            </Link>
            {!lease.terminatedAt && (
              <Button variant="danger-soft" onPress={() => setTerminating(true)}>
                <CircleSlash className="size-4" aria-hidden />
                {t('contracts.detail.terminate')}
              </Button>
            )}
          </div>
        )}
      </header>

      {isClosed && lease.terminatedAt && (
        <Notice tone="default" icon={CircleSlash}>
          {t('contracts.detail.notice.terminated', {
            date: date(lease.terminatedAt),
            reason: lease.terminationReason
              ? t(`contracts.terminationReason.${lease.terminationReason}`)
              : '—',
          })}
        </Notice>
      )}
      {plannedTermination && (
        <Notice tone="warning" icon={AlertTriangle}>
          {t('contracts.detail.notice.plannedTermination', { date: date(lease.terminatedAt!) })}
        </Notice>
      )}
      {status === 'expired' && (
        <Notice tone="warning" icon={AlertTriangle}>
          {t('contracts.detail.notice.expired', { date: date(lease.endDate) })}
        </Notice>
      )}
      {status === 'upcoming' && (
        <Notice tone="default" icon={Info}>
          {t('contracts.detail.notice.upcoming', { date: date(lease.startDate) })}
        </Notice>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 [&>*]:min-w-0">
        <StatTile
          label={t('contracts.detail.stats.monthly')}
          value={f.money(lease.rent + lease.charges)}
          icon={Wallet}
          tone="night"
          delta={t('contracts.detail.stats.monthlyHint', {
            rent: f.money(lease.rent),
            charges: f.money(lease.charges),
          })}
        />
        <StatTile
          label={t('contracts.detail.stats.deposit')}
          value={f.money(lease.deposit)}
          icon={PiggyBank}
          tone="green"
          delta={
            lease.rent
              ? t('contracts.detail.stats.depositHint', {
                  count: Math.round((lease.deposit / lease.rent) * 10) / 10,
                })
              : undefined
          }
        />
        <StatTile
          label={t('contracts.detail.stats.paymentDay')}
          value={t('contracts.detail.stats.paymentDayValue', { day: lease.paymentDay })}
          icon={CalendarDays}
          tone="yellow"
          delta={t('contracts.detail.stats.paymentDayHint')}
        />
        <StatTile
          label={t('contracts.detail.stats.end')}
          value={date(lease.endDate)}
          icon={CalendarClock}
          tone="red"
          delta={
            status === 'active' && daysLeft >= 0
              ? t('tenants.leaseEndsIn', { count: daysLeft })
              : t('contracts.duration', { count: months })
          }
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-3 xl:items-start">
        <Card className="gap-2 p-5 xl:col-span-2">
          <Card.Header>
            <Card.Title className="font-display text-base">
              {t('contracts.detail.terms.title')}
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <dl className="divide-y divide-separator">
              <Item label={t('contracts.detail.terms.type')}>
                {t(`contracts.type.${lease.type}`)}
              </Item>
              <Item label={t('contracts.detail.terms.period')}>
                <span className="tabular-nums">
                  {date(lease.startDate)} → {date(lease.endDate)}
                </span>
                <span className="text-muted"> · {t('contracts.duration', { count: months })}</span>
                {status === 'active' && (
                  <LeaseProgress
                    start={lease.startDate}
                    end={lease.endDate}
                    className="mt-2 max-w-xs"
                  />
                )}
              </Item>
              <Item label={t('contracts.detail.terms.rent')}>
                <span className="font-semibold tabular-nums">{f.money(lease.rent)}</span>
                <span className="text-muted">
                  {' '}
                  {t('properties.detail.units.charges', { amount: f.money(lease.charges) })}
                </span>
              </Item>
              <Item label={t('contracts.detail.terms.deposit')}>
                <span className="tabular-nums">{f.money(lease.deposit)}</span>
              </Item>
              <Item label={t('contracts.detail.terms.paymentDay')}>
                {t('contracts.detail.terms.paymentDayValue', { day: lease.paymentDay })}
              </Item>
              <Item label={t('contracts.detail.terms.renewal')}>
                {lease.tacitRenewal
                  ? t('contracts.detail.terms.tacitRenewal')
                  : t('contracts.detail.terms.noRenewal')}
              </Item>
              <Item label={t('contracts.detail.terms.createdAt')}>{date(lease.createdAt)}</Item>
              <Item label={t('tenants.detail.contact.notes')}>
                {lease.notes ?? (
                  <span className="text-muted">{t('tenants.detail.contact.noNotes')}</span>
                )}
              </Item>
            </dl>
          </Card.Content>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="gap-3 p-5">
            <Card.Header>
              <Card.Title className="font-display text-base">
                {t('contracts.detail.tenant')}
              </Card.Title>
            </Card.Header>
            <Card.Content>
              {tenant ? (
                <Link
                  to={`/tenants/${tenant.id}`}
                  className="group flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <TenantAvatar tenant={tenant} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium group-hover:underline">{tenant.name}</p>
                    <p className="truncate text-xs text-muted tabular-nums">{tenant.phone}</p>
                    {tenant.email && <p className="truncate text-xs text-muted">{tenant.email}</p>}
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
                </Link>
              ) : (
                <p className="text-sm text-muted">{t('contracts.unknownTenant')}</p>
              )}
            </Card.Content>
          </Card>

          <Card className="gap-3 p-5">
            <Card.Header>
              <Card.Title className="font-display text-base">
                {t('contracts.detail.unit')}
              </Card.Title>
            </Card.Header>
            <Card.Content>
              {property && unit && PropertyIcon ? (
                <Link
                  to={`/properties/${property.id}`}
                  className="group flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-default text-default-foreground">
                    <PropertyIcon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium group-hover:underline">{property.name}</p>
                    <p className="truncate text-xs text-muted">
                      {unit.label} · {t(`properties.unitKind.${unit.kind}`)} · {f.number(unit.area)}{' '}
                      m²
                    </p>
                    <p className="truncate text-xs text-muted">
                      {property.address.street}, {property.address.city}
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
                </Link>
              ) : (
                <p className="text-sm text-muted">—</p>
              )}
            </Card.Content>
          </Card>
        </div>
      </div>

      <TerminateLeaseModal lease={lease} isOpen={terminating} onOpenChange={setTerminating} />
    </div>
  )
}

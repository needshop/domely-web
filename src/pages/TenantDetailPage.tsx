import { Breadcrumbs, buttonVariants, Card, Chip } from '@heroui/react'
import {
  ArrowLeft,
  CalendarClock,
  CalendarDays,
  FilePlus2,
  KeyRound,
  Mail,
  Pencil,
  Phone,
  Wallet,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { StatTile } from '@/components/StatTile'
import { useTenantRow } from '@/features/tenants/api'
import { TenantAvatar } from '@/features/tenants/components/TenantAvatar'
import { TenantContact } from '@/features/tenants/components/TenantContact'
import { TenantLeases } from '@/features/tenants/components/TenantLeases'
import { TenantStatusChip } from '@/features/tenants/components/TenantStatusChip'
import { daysUntil } from '@/lib/dates'
import { useFormatters } from '@/lib/format'

export function TenantDetailPage() {
  const { t } = useTranslation()
  const f = useFormatters()
  const { id } = useParams()
  const row = useTenantRow(id)

  if (!row) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 py-16 text-center">
        <p className="font-display text-lg">{t('tenants.detail.notFound')}</p>
        <Link to="/tenants" className={buttonVariants({ variant: 'secondary' })}>
          <ArrowLeft className="size-4" aria-hidden />
          {t('tenants.detail.back')}
        </Link>
      </div>
    )
  }

  const { tenant, leases, status, monthlyDue, nextLeaseEnd } = row
  const date = (iso: string) => f.dayMonthYear(new Date(`${iso}T12:00:00`))

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <Breadcrumbs>
        <Breadcrumbs.Item href="/tenants">{t('tenants.title')}</Breadcrumbs.Item>
        <Breadcrumbs.Item>{tenant.name}</Breadcrumbs.Item>
      </Breadcrumbs>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <TenantAvatar tenant={tenant} size="lg" className="size-16 text-lg" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl">{tenant.name}</h1>
              <Chip size="sm" variant="soft">
                {t(`tenants.kind.${tenant.kind}`)}
              </Chip>
              <TenantStatusChip status={status} />
            </div>
            <p className="mt-1 text-sm text-muted">
              {tenant.occupation && `${tenant.occupation} · `}
              {t('tenants.detail.since', { date: date(tenant.createdAt) })}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`tel:${tenant.phone.replace(/\s+/g, '')}`}
            className={buttonVariants({ variant: 'secondary' })}
          >
            <Phone className="size-4" aria-hidden />
            {t('tenants.detail.call')}
          </a>
          {tenant.email && (
            <a href={`mailto:${tenant.email}`} className={buttonVariants({ variant: 'secondary' })}>
              <Mail className="size-4" aria-hidden />
              {t('tenants.detail.email')}
            </a>
          )}
          <Link
            to={`/contracts/new?tenant=${tenant.id}`}
            className={buttonVariants({ variant: 'primary' })}
          >
            <FilePlus2 className="size-4" aria-hidden />
            {t('tenants.detail.newContract')}
          </Link>
          <Link
            to={`/tenants/${tenant.id}/edit`}
            className={buttonVariants({ variant: 'secondary' })}
          >
            <Pencil className="size-4" aria-hidden />
            {t('tenants.detail.edit')}
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 [&>*]:min-w-0">
        <StatTile
          label={t('tenants.detail.stats.monthlyDue')}
          value={monthlyDue ? f.money(monthlyDue) : '—'}
          icon={Wallet}
          tone="night"
          delta={t('tenants.detail.stats.monthlyDueHint')}
        />
        <StatTile
          label={t('tenants.detail.stats.units')}
          value={f.number(leases.length)}
          icon={KeyRound}
          tone="yellow"
          delta={
            leases.length
              ? t('tenants.detail.stats.properties', {
                  count: new Set(leases.map((l) => l.property.id)).size,
                })
              : t('tenants.noLease')
          }
        />
        <StatTile
          label={t('tenants.detail.stats.nextLeaseEnd')}
          value={nextLeaseEnd ? date(nextLeaseEnd) : '—'}
          icon={CalendarClock}
          tone="green"
          delta={
            nextLeaseEnd && daysUntil(nextLeaseEnd) >= 0
              ? t('tenants.leaseEndsIn', { count: daysUntil(nextLeaseEnd) })
              : undefined
          }
        />
        <StatTile
          label={t('tenants.detail.stats.since')}
          value={date(tenant.createdAt)}
          icon={CalendarDays}
          tone="red"
          delta={t('tenants.detail.stats.sinceHint')}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-3 xl:items-start">
        <Card className="gap-2 p-5 xl:col-span-2">
          <Card.Header>
            <Card.Title className="font-display text-base">
              {t('tenants.detail.leases.title')}
              <span className="ml-1.5 text-xs text-muted tabular-nums">{leases.length}</span>
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <TenantLeases leases={leases} />
          </Card.Content>
        </Card>
        <Card className="gap-1 p-5">
          <Card.Header>
            <Card.Title className="font-display text-base">
              {t('tenants.detail.contact.title')}
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <TenantContact tenant={tenant} />
          </Card.Content>
        </Card>
      </div>
    </div>
  )
}

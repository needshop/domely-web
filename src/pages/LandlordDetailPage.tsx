import { Breadcrumbs, buttonVariants, Card, Chip } from '@heroui/react'
import { ArrowLeft, Building2, HandCoins, Mail, Pencil, Percent, Phone, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { StatTile } from '@/components/StatTile'
import { useLandlordRow } from '@/features/landlords/api'
import { LandlordAvatar } from '@/features/landlords/components/LandlordAvatar'
import { LandlordContact } from '@/features/landlords/components/LandlordContact'
import { LandlordProperties } from '@/features/landlords/components/LandlordProperties'
import { useFormatters } from '@/lib/format'

export function LandlordDetailPage() {
  const { t } = useTranslation()
  const f = useFormatters()
  const { id } = useParams()
  const row = useLandlordRow(id)

  if (!row) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 py-16 text-center">
        <p className="font-display text-lg">{t('landlords.detail.notFound')}</p>
        <Link to="/landlords" className={buttonVariants({ variant: 'secondary' })}>
          <ArrowLeft className="size-4" aria-hidden />
          {t('landlords.detail.back')}
        </Link>
      </div>
    )
  }

  const { landlord, properties } = row
  const date = (iso: string) => f.dayMonthYear(new Date(`${iso}T12:00:00`))

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <Breadcrumbs>
        <Breadcrumbs.Item href="/landlords">{t('landlords.title')}</Breadcrumbs.Item>
        <Breadcrumbs.Item>{landlord.name}</Breadcrumbs.Item>
      </Breadcrumbs>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <LandlordAvatar landlord={landlord} size="lg" className="size-16 text-lg" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl">{landlord.name}</h1>
              <Chip size="sm" variant="soft">
                {t(`landlords.kind.${landlord.kind}`)}
              </Chip>
            </div>
            <p className="mt-1 text-sm text-muted">
              {landlord.mandateStart
                ? t('landlords.detail.mandateSince', { date: date(landlord.mandateStart) })
                : t('landlords.detail.addedOn', { date: date(landlord.createdAt) })}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`tel:${landlord.phone.replace(/\s+/g, '')}`}
            className={buttonVariants({ variant: 'secondary' })}
          >
            <Phone className="size-4" aria-hidden />
            {t('landlords.detail.call')}
          </a>
          <a href={`mailto:${landlord.email}`} className={buttonVariants({ variant: 'secondary' })}>
            <Mail className="size-4" aria-hidden />
            {t('landlords.detail.email')}
          </a>
          <Link
            to={`/landlords/${landlord.id}/edit`}
            className={buttonVariants({ variant: 'primary' })}
          >
            <Pencil className="size-4" aria-hidden />
            {t('landlords.detail.edit')}
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 [&>*]:min-w-0">
        <StatTile
          label={t('landlords.detail.stats.properties')}
          value={f.number(properties.length)}
          icon={Building2}
          tone="yellow"
          delta={t('landlords.unitsCount', { count: row.units })}
        />
        <StatTile
          label={t('landlords.detail.stats.occupancy')}
          value={row.units ? f.percent(row.occupancyRate) : '—'}
          icon={Percent}
          tone="green"
          delta={
            row.units
              ? t('landlords.detail.stats.occupancyHint', { rented: row.rented, units: row.units })
              : undefined
          }
        />
        <StatTile
          label={t('landlords.detail.stats.monthlyRent')}
          value={f.money(row.monthlyRent)}
          icon={Wallet}
          tone="night"
          delta={
            row.lateCount
              ? t('landlords.detail.stats.late', { count: row.lateCount })
              : t('landlords.detail.stats.monthlyRentHint')
          }
        />
        <StatTile
          label={t('landlords.detail.stats.fees')}
          value={landlord.feeRate !== undefined ? f.money(row.monthlyFees) : '—'}
          icon={HandCoins}
          tone="red"
          delta={
            landlord.feeRate !== undefined
              ? t('landlords.feeRateLong', { rate: f.number(landlord.feeRate) })
              : t('landlords.detail.stats.noFeeRate')
          }
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-3 xl:items-start [&>*]:min-w-0">
        <Card className="gap-2 p-5 xl:col-span-2">
          <Card.Header>
            <Card.Title className="font-display text-base">
              {t('landlords.detail.properties.title')}
              <span className="ml-1.5 text-xs text-muted tabular-nums">{properties.length}</span>
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <LandlordProperties landlordId={landlord.id} properties={properties} />
          </Card.Content>
        </Card>
        <Card className="gap-1 p-5">
          <Card.Header>
            <Card.Title className="font-display text-base">
              {t('landlords.detail.contact')}
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <LandlordContact landlord={landlord} />
          </Card.Content>
        </Card>
      </div>
    </div>
  )
}

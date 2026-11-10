import { Breadcrumbs, buttonVariants, Card, Chip, Tabs } from '@heroui/react'
import { AlertCircle, ArrowLeft, KeyRound, MapPin, Pencil, Percent, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { StatTile } from '@/components/StatTile'
import { useProperty } from '@/features/properties/api'
import { PropertyInfo } from '@/features/properties/components/PropertyInfo'
import { PropertyUnitsTable } from '@/features/properties/components/PropertyUnitsTable'
import { propertyVisual } from '@/features/properties/propertyVisual'
import { propertyStats } from '@/features/properties/utils'
import { cn } from '@/lib/cn'
import { useFormatters } from '@/lib/format'

export function PropertyDetailPage() {
  const { t } = useTranslation()
  const f = useFormatters()
  const { id } = useParams()
  const property = useProperty(id)

  if (!property) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 py-16 text-center">
        <p className="font-display text-lg">{t('properties.detail.notFound')}</p>
        <Link to="/properties" className={buttonVariants({ variant: 'secondary' })}>
          <ArrowLeft className="size-4" aria-hidden />
          {t('properties.detail.back')}
        </Link>
      </div>
    )
  }

  const stats = propertyStats(property)
  const { icon: Icon, gradient } = propertyVisual[property.type]

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <Breadcrumbs>
        <Breadcrumbs.Item href="/properties">{t('properties.title')}</Breadcrumbs.Item>
        <Breadcrumbs.Item>{property.name}</Breadcrumbs.Item>
      </Breadcrumbs>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span
            className={cn(
              'flex size-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br text-foreground/70',
              gradient,
            )}
          >
            <Icon className="size-8" strokeWidth={1.5} aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl">{property.name}</h1>
              <Chip size="sm" variant="soft">
                {t(`properties.type.${property.type}`)}
              </Chip>
            </div>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted">
              <MapPin className="size-4 shrink-0" aria-hidden />
              {property.address.street}, {property.address.district}, {property.address.city}
            </p>
          </div>
        </div>
        <Link
          to={`/properties/${property.id}/edit`}
          className={buttonVariants({ variant: 'secondary' })}
        >
          <Pencil className="size-4" aria-hidden />
          {t('properties.detail.edit')}
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 [&>*]:min-w-0">
        <StatTile
          label={t('properties.detail.stats.units')}
          value={f.number(stats.units)}
          icon={KeyRound}
          tone="yellow"
          delta={t('properties.stats.vacant', { count: stats.vacant })}
        />
        <StatTile
          label={t('properties.detail.stats.occupancy')}
          value={f.percent(stats.occupancyRate)}
          icon={Percent}
          tone="green"
          delta={t('properties.stats.rentedOf', { rented: stats.rented, total: stats.units })}
        />
        <StatTile
          label={t('properties.detail.stats.monthlyRent')}
          value={f.money(stats.monthlyRent)}
          icon={Wallet}
          tone="night"
          delta={t('properties.detail.stats.potential', { amount: f.money(stats.potentialRent) })}
        />
        <StatTile
          label={t('properties.detail.stats.late')}
          value={f.number(stats.lateCount)}
          icon={AlertCircle}
          tone="red"
          delta={
            stats.lateCount === 0
              ? t('properties.detail.stats.allUpToDate')
              : t('properties.stats.late', { count: stats.lateCount })
          }
        />
      </section>

      <Card className="p-0">
        <Tabs variant="secondary" className="w-full">
          <Tabs.ListContainer className="border-b border-separator px-5 pt-3">
            <Tabs.List aria-label={t('properties.detail.tabs')}>
              <Tabs.Tab id="units">
                {t('properties.detail.tabUnits')}
                <span className="ml-1.5 text-xs text-muted tabular-nums">{stats.units}</span>
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="info">
                {t('properties.detail.tabInfo')}
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
          <Tabs.Panel id="units" className="p-2 sm:p-3">
            <PropertyUnitsTable units={property.units} propertyId={property.id} />
          </Tabs.Panel>
          <Tabs.Panel id="info" className="px-5 py-2">
            <PropertyInfo property={property} stats={stats} />
          </Tabs.Panel>
        </Tabs>
      </Card>
    </div>
  )
}

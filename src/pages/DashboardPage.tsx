import { buttonVariants } from '@heroui/react'
import { AlertCircle, Building2, Plus, Users, Wallet } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { DeadlinesCard } from '@/features/dashboard/components/DeadlinesCard'
import { LateRentsCard } from '@/features/dashboard/components/LateRentsCard'
import { MaintenanceCard } from '@/features/dashboard/components/MaintenanceCard'
import { OccupancyCard } from '@/features/dashboard/components/OccupancyCard'
import { RecentPropertiesCard } from '@/features/dashboard/components/RecentPropertiesCard'
import { RentCollectionChart } from '@/components/charts/RentCollectionChart'
import { StatTile } from '@/components/StatTile'
import { dashboardMock } from '@/features/dashboard/mockData'
import type { LateRent, MonthlyCollection } from '@/features/dashboard/types'
import { useProperties } from '@/features/properties/api'
import { portfolioStats } from '@/features/properties/utils'
import { useInterventionRows } from '@/features/maintenance/api'
import { isOpen, priorityOrder } from '@/features/maintenance/utils'
import { useRentDues } from '@/features/rents/api'
import { useSettings } from '@/features/settings/api'
import { currentPeriod, isOverdue, periodsBetween, shiftPeriod } from '@/features/rents/utils'
import { useTenantRows } from '@/features/tenants/api'
import { tenantsSummary } from '@/features/tenants/utils'
import { useFormatters } from '@/lib/format'

export function DashboardPage() {
  const { t } = useTranslation()
  const f = useFormatters()
  const { kpis, deadlines } = dashboardMock
  const profileName = useSettings().profile.name.trim()
  // Biens, lots et occupation : mêmes données que le module Biens
  const properties = useProperties()
  const portfolio = portfolioStats(properties)
  const tenants = tenantsSummary(useTenantRows())
  const occupancy = {
    rented: portfolio.rented,
    vacant: portfolio.vacant,
    underWorks: portfolio.underWorks,
  }
  const recentProperties = [...properties]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3)
  // Date de référence figée au montage (stable entre les rendus)
  const [today] = useState(() => new Date())

  // Interventions à traiter : urgentes d'abord, puis les plus anciennes
  const maintenance = useInterventionRows()
    .filter((r) => isOpen(r.intervention.status))
    .sort(
      (a, b) =>
        priorityOrder[a.intervention.priority] - priorityOrder[b.intervention.priority] ||
        a.intervention.reportedAt.localeCompare(b.intervention.reportedAt),
    )
    .slice(0, 4)

  // Loyers : échéances calculées à partir des contrats et des encaissements
  const dues = useRentDues()
  const thisMonth = currentPeriod()
  const collections: MonthlyCollection[] = periodsBetween(
    shiftPeriod(thisMonth, -11),
    thisMonth,
  ).map((period) => {
    const inPeriod = dues.filter((r) => r.due.period === period)
    return {
      month: `${period}-01`,
      expected: inPeriod.reduce((s, r) => s + r.due.amount, 0),
      collected: inPeriod.reduce((s, r) => s + r.due.paid, 0),
    }
  })
  const collected = collections[collections.length - 1].collected
  const previousCollected = collections[collections.length - 2].collected
  const collectedDelta = previousCollected ? (collected - previousCollected) / previousCollected : 0

  const overdue = dues
    .filter((r) => isOverdue(r.due))
    .sort((a, b) => a.due.dueDate.localeCompare(b.due.dueDate))
  const unpaidTotal = overdue.reduce((sum, r) => sum + r.due.remaining, 0)
  const unpaidTenants = new Set(overdue.map((r) => r.lease.tenantId)).size
  const lateRents: LateRent[] = overdue.slice(0, 5).map((r) => ({
    id: r.due.id,
    tenant: r.tenant?.name ?? '—',
    property: `${r.property?.name ?? '—'} · ${r.unit?.label ?? '—'}`,
    amount: r.due.remaining,
    dueDate: r.due.dueDate,
  }))

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl">
            {profileName
              ? t('dashboard.greetingName', { name: profileName.split(' ')[0] })
              : t('dashboard.greeting')}
          </h1>
          <p className="mt-1 text-sm text-muted">{t('dashboard.subtitle')}</p>
        </div>
        <Link to="/properties/new" className={buttonVariants({ variant: 'primary' })}>
          <Plus className="size-4" aria-hidden />
          {t('dashboard.addProperty')}
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 [&>*]:min-w-0">
        <StatTile
          label={t('dashboard.kpi.properties')}
          value={f.number(portfolio.properties)}
          icon={Building2}
          tone="red"
          delta={t('dashboard.kpi.addedThisMonth', { count: kpis.properties.addedThisMonth })}
          trend="up"
        />
        <StatTile
          label={t('dashboard.kpi.tenants')}
          value={f.number(tenants.active)}
          icon={Users}
          tone="yellow"
          delta={t('dashboard.kpi.addedThisMonth', { count: kpis.tenants.newThisMonth })}
          trend="up"
        />
        <StatTile
          label={t('dashboard.kpi.collected', { month: f.monthShort(today) })}
          value={f.money(collected)}
          icon={Wallet}
          tone="green"
          delta={t('dashboard.kpi.vsLastMonth', { delta: f.signedPercent(collectedDelta) })}
          trend={collectedDelta >= 0 ? 'up' : 'down'}
        />
        <StatTile
          label={t('dashboard.kpi.unpaid')}
          value={f.money(unpaidTotal)}
          icon={AlertCircle}
          tone="night"
          delta={t('dashboard.kpi.unpaidTenants', { count: unpaidTenants })}
        />
      </section>

      {/* items-start : déplier le tableau du graphique n'étire pas la carte Occupation */}
      <div className="grid gap-6 xl:grid-cols-3 xl:items-start [&>*]:min-w-0">
        <div className="xl:col-span-2">
          <RentCollectionChart data={collections} />
        </div>
        {/* Hauteur fixe en desktop = hauteur de la carte du graphique, tableau fermé (368px) */}
        <OccupancyCard occupancy={occupancy} className="xl:h-92" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3 [&>*]:min-w-0">
        <div className="xl:col-span-2">
          <LateRentsCard items={lateRents} total={unpaidTotal} today={today} />
        </div>
        <DeadlinesCard items={deadlines} today={today} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3 [&>*]:min-w-0">
        <div className="xl:col-span-2">
          <RecentPropertiesCard items={recentProperties} />
        </div>
        <MaintenanceCard items={maintenance} />
      </div>
    </div>
  )
}

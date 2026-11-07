import { Button } from '@heroui/react'
import { AlertCircle, Building2, Plus, Users, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { DeadlinesCard } from '@/features/dashboard/components/DeadlinesCard'
import { LateRentsCard } from '@/features/dashboard/components/LateRentsCard'
import { MaintenanceCard } from '@/features/dashboard/components/MaintenanceCard'
import { OccupancyCard } from '@/features/dashboard/components/OccupancyCard'
import { RecentPropertiesCard } from '@/features/dashboard/components/RecentPropertiesCard'
import { RentCollectionChart } from '@/features/dashboard/components/RentCollectionChart'
import { StatTile } from '@/features/dashboard/components/StatTile'
import { dashboardMock, MOCK_TODAY } from '@/features/dashboard/mockData'
import { useFormatters } from '@/lib/format'

export function DashboardPage() {
  const { t } = useTranslation()
  const f = useFormatters()
  const { kpis, collections, occupancy, lateRents, deadlines, maintenance, recentProperties } =
    dashboardMock
  const today = MOCK_TODAY

  const collectedDelta =
    (kpis.collected.amount - kpis.collected.previousAmount) / kpis.collected.previousAmount
  const unpaidTotal = lateRents.reduce((sum, r) => sum + r.amount, 0)

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl">{t('dashboard.greeting')}</h1>
          <p className="mt-1 text-sm text-muted">{t('dashboard.subtitle')}</p>
        </div>
        <Button variant="primary">
          <Plus className="size-4" aria-hidden />
          {t('dashboard.addProperty')}
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 [&>*]:min-w-0">
        <StatTile
          label={t('dashboard.kpi.properties')}
          value={f.number(kpis.properties.total)}
          icon={Building2}
          tone="red"
          delta={t('dashboard.kpi.addedThisMonth', { count: kpis.properties.addedThisMonth })}
          trend="up"
        />
        <StatTile
          label={t('dashboard.kpi.tenants')}
          value={f.number(kpis.tenants.active)}
          icon={Users}
          tone="yellow"
          delta={t('dashboard.kpi.addedThisMonth', { count: kpis.tenants.newThisMonth })}
          trend="up"
        />
        <StatTile
          label={t('dashboard.kpi.collected', { month: f.monthShort(today) })}
          value={f.money(kpis.collected.amount)}
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
          delta={t('dashboard.kpi.unpaidTenants', { count: lateRents.length })}
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
          <LateRentsCard items={lateRents} today={today} />
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

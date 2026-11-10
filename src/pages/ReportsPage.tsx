import { CheckCircle2, Download, PiggyBank, TrendingUp, Wrench } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { HorizontalBars } from '@/components/charts/HorizontalBars'
import { RentCollectionChart } from '@/components/charts/RentCollectionChart'
import { FilterSelect } from '@/components/FilterSelect'
import { StatTile } from '@/components/StatTile'
import { useInterventions } from '@/features/maintenance/api'
import { useProperties } from '@/features/properties/api'
import { useRentDues } from '@/features/rents/api'
import { DebtorsList } from '@/features/reports/components/DebtorsList'
import { PropertyPerformanceTable } from '@/features/reports/components/PropertyPerformanceTable'
import { ReportCard } from '@/features/reports/components/ReportCard'
import { useReportFilters } from '@/features/reports/hooks/useReportFilters'
import {
  agingReport,
  expensesByCategory,
  monthlyCollections,
  performanceTotals,
  periodRange,
  propertyPerformance,
  topDebtors,
} from '@/features/reports/utils'
import { downloadCsv } from '@/lib/csv'
import { todayIso } from '@/lib/dates'
import { useFormatters } from '@/lib/format'

export function ReportsPage() {
  const { t } = useTranslation()
  const f = useFormatters()
  const { periods, period, property, setPeriod, setProperty } = useReportFilters()
  const allProperties = useProperties()
  const allDues = useRentDues()
  const allInterventions = useInterventions()

  // Filtre « bien » appliqué à toutes les données du rapport
  const properties = useMemo(
    () => (property === 'all' ? allProperties : allProperties.filter((p) => p.id === property)),
    [allProperties, property],
  )
  const dues = useMemo(
    () => (property === 'all' ? allDues : allDues.filter((r) => r.lease.propertyId === property)),
    [allDues, property],
  )
  const interventions = useMemo(
    () =>
      property === 'all'
        ? allInterventions
        : allInterventions.filter((i) => i.propertyId === property),
    [allInterventions, property],
  )

  const range = useMemo(() => periodRange(period), [period])
  const monthly = useMemo(() => monthlyCollections(dues, range), [dues, range])
  const performance = useMemo(
    () => propertyPerformance(properties, dues, interventions, range),
    [properties, dues, interventions, range],
  )
  const totals = performanceTotals(performance)
  const aging = useMemo(() => agingReport(dues), [dues])
  const debtors = useMemo(() => topDebtors(dues), [dues])
  const expenses = useMemo(() => expensesByCategory(interventions, range), [interventions, range])

  const date = (iso: string) => f.dayMonthYear(new Date(`${iso}T12:00:00`))
  const periodLabel = (p: string) => (p === '12m' ? t('reports.period.last12') : p)
  const rangeLabel = t('reports.period.range', { from: date(range.from), to: date(range.to) })
  const thisMonth = todayIso().slice(0, 7)
  const currentIndex = range.months.indexOf(thisMonth)

  const exportPerformance = () =>
    downloadCsv(`domely-performance-${period}.csv`, [
      [
        t('reports.table.property'),
        t('properties.filters.city'),
        t('reports.table.occupancy'),
        `${t('reports.table.expected')} (XOF)`,
        `${t('reports.table.collected')} (XOF)`,
        t('reports.table.rate'),
        `${t('reports.table.overdue')} (XOF)`,
        `${t('reports.table.expenses')} (XOF)`,
        `${t('reports.table.net')} (XOF)`,
      ],
      ...performance.map((r) => [
        r.property.name,
        r.property.address.city,
        Math.round(r.occupancyRate * 100) / 100,
        r.expected,
        r.collected,
        Math.round(r.rate * 1000) / 1000,
        r.overdue,
        r.expenses,
        r.net,
      ]),
    ])

  const exportMonthly = () =>
    downloadCsv(`domely-encaissements-${period}.csv`, [
      [
        t('dashboard.collections.month'),
        `${t('reports.table.expected')} (XOF)`,
        `${t('reports.table.collected')} (XOF)`,
      ],
      ...monthly.map((m) => [m.month.slice(0, 7), m.expected, m.collected]),
    ])

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl">{t('nav.reports')}</h1>
          <p className="mt-1 text-sm text-muted">{rangeLabel}</p>
        </div>
        <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto">
          <FilterSelect
            label={t('reports.period.label')}
            value={period}
            onChange={setPeriod}
            options={periods.map((p) => ({ id: p, label: periodLabel(p) }))}
          />
          <FilterSelect
            label={t('contracts.filters.property')}
            value={property}
            onChange={setProperty}
            className="sm:min-w-56"
            options={[
              { id: 'all', label: t('tenants.filters.allProperties') },
              ...[...allProperties]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((p) => ({ id: p.id, label: p.name })),
            ]}
          />
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 [&>*]:min-w-0">
        <StatTile
          label={t('reports.kpi.collected')}
          value={f.money(totals.collected)}
          icon={PiggyBank}
          tone="green"
          delta={t('reports.kpi.collectedHint', { amount: f.money(totals.expected) })}
        />
        <StatTile
          label={t('reports.kpi.rate')}
          value={f.percent(totals.rate)}
          icon={CheckCircle2}
          tone="yellow"
          delta={
            totals.overdue
              ? t('reports.kpi.rateHint', { amount: f.money(totals.overdue) })
              : t('reports.kpi.rateFull')
          }
        />
        <StatTile
          label={t('reports.kpi.expenses')}
          value={f.money(totals.expenses)}
          icon={Wrench}
          tone="red"
          delta={t('reports.kpi.expensesHint', { count: expenses.count })}
        />
        <StatTile
          label={t('reports.kpi.net')}
          value={f.money(totals.net)}
          icon={TrendingUp}
          tone="night"
          delta={t('reports.kpi.netHint')}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-3 xl:items-start [&>*]:min-w-0">
        <div className="xl:col-span-2">
          <RentCollectionChart
            data={monthly}
            subtitle={periodLabel(period)}
            highlightIndex={currentIndex >= 0 ? currentIndex : null}
            action={
              <button
                type="button"
                onClick={exportMonthly}
                aria-label={t('reports.exportMonthlyLabel')}
                className="inline-flex items-center gap-1 text-xs text-muted outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-focus"
              >
                <Download className="size-3.5" aria-hidden />
                {t('reports.exportCsv')}
              </button>
            }
          />
        </div>

        <ReportCard
          title={t('reports.expenses.title')}
          subtitle={t('reports.expenses.subtitle', {
            owner: f.money(expenses.owner),
            tenant: f.money(expenses.tenant),
          })}
        >
          {expenses.categories.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">{t('reports.expenses.none')}</p>
          ) : (
            <HorizontalBars
              items={expenses.categories.map((c) => ({
                id: c.category,
                label: t(`maintenance.category.${c.category}`),
                hint: t('reports.expenses.count', { count: c.count }),
                value: c.amount,
                display: f.money(c.amount),
              }))}
            />
          )}
        </ReportCard>
      </div>

      <ReportCard
        title={t('reports.performance.title')}
        subtitle={t('reports.performance.subtitle')}
        onExport={exportPerformance}
      >
        <PropertyPerformanceTable rows={performance} />
      </ReportCard>

      <div className="grid gap-6 xl:grid-cols-2 [&>*]:min-w-0">
        <ReportCard title={t('reports.aging.title')} subtitle={t('reports.aging.subtitle')}>
          <HorizontalBars
            items={aging.map((a) => ({
              id: a.bucket,
              label: t(`reports.aging.bucket.${a.bucket}`),
              hint: t('reports.aging.count', { count: a.count }),
              value: a.amount,
              display: a.amount ? f.money(a.amount) : '—',
            }))}
          />
        </ReportCard>
        <ReportCard title={t('reports.debtors.title')} subtitle={t('reports.aging.subtitle')}>
          <DebtorsList debtors={debtors} />
        </ReportCard>
      </div>
    </div>
  )
}

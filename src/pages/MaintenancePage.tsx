import { Button, buttonVariants } from '@heroui/react'
import { AlertTriangle, CalendarClock, ClipboardList, Plus, SearchX, Wallet } from 'lucide-react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { ListPagination } from '@/components/ListPagination'
import { StatTile } from '@/components/StatTile'
import { useInterventionRows } from '@/features/maintenance/api'
import { InterventionCard } from '@/features/maintenance/components/InterventionCard'
import { InterventionsTable } from '@/features/maintenance/components/InterventionsTable'
import { MaintenanceToolbar } from '@/features/maintenance/components/MaintenanceToolbar'
import {
  MAINTENANCE_PAGE_SIZE,
  useMaintenanceFilters,
} from '@/features/maintenance/hooks/useMaintenanceFilters'
import { maintenanceSummary } from '@/features/maintenance/utils'
import { useFormatters } from '@/lib/format'

export function MaintenancePage() {
  const { t } = useTranslation()
  const f = useFormatters()
  const rows = useInterventionRows()
  const {
    filters,
    setFilter,
    reset,
    properties,
    results,
    pageResults,
    page,
    pageCount,
    setPage,
    isFiltered,
  } = useMaintenanceFilters(rows)
  const summary = maintenanceSummary(rows)
  const listTop = useRef<HTMLParagraphElement>(null)

  const changePage = (next: number) => {
    setPage(next)
    listTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl">{t('nav.maintenance')}</h1>
          <p className="mt-1 text-sm text-muted">
            {t('maintenance.subtitle', { count: summary.open })}
          </p>
        </div>
        <Link to="/maintenance/new" className={buttonVariants({ variant: 'primary' })}>
          <Plus className="size-4" aria-hidden />
          {t('maintenance.add')}
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 [&>*]:min-w-0">
        <StatTile
          label={t('maintenance.stats.open')}
          value={f.number(summary.open)}
          icon={ClipboardList}
          tone="yellow"
          delta={t('maintenance.stats.openHint', {
            new: summary.newCount,
            inProgress: summary.inProgress,
          })}
        />
        <StatTile
          label={t('maintenance.stats.urgent')}
          value={f.number(summary.urgent)}
          icon={AlertTriangle}
          tone="red"
          delta={t('maintenance.stats.urgentHint')}
        />
        <StatTile
          label={t('maintenance.stats.scheduledSoon')}
          value={f.number(summary.scheduledSoon)}
          icon={CalendarClock}
          tone="green"
          delta={t('maintenance.stats.scheduledSoonHint')}
        />
        <StatTile
          label={t('maintenance.stats.spent')}
          value={f.money(summary.spentThisYear)}
          icon={Wallet}
          tone="night"
          delta={t('maintenance.stats.spentHint', { count: summary.doneThisYear })}
        />
      </section>

      <MaintenanceToolbar
        filters={filters}
        properties={properties}
        isFiltered={isFiltered}
        onFilter={setFilter}
        onReset={reset}
      />

      <p ref={listTop} className="-mt-2 scroll-mt-20 text-sm text-muted" aria-live="polite">
        {t('tenants.filters.results', { count: results.length })}
      </p>

      {results.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <SearchX className="size-10 text-muted" strokeWidth={1.5} aria-hidden />
          <p className="font-display">{t('maintenance.empty.title')}</p>
          <p className="max-w-sm text-sm text-muted">{t('maintenance.empty.description')}</p>
          {isFiltered && (
            <Button variant="secondary" size="sm" onPress={reset}>
              {t('contracts.filters.reset')}
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <InterventionsTable rows={pageResults} />
          </div>
          <ul className="grid gap-3 md:hidden">
            {pageResults.map((row) => (
              <InterventionCard key={row.intervention.id} row={row} />
            ))}
          </ul>
        </>
      )}

      <ListPagination
        page={page}
        pageCount={pageCount}
        pageSize={MAINTENANCE_PAGE_SIZE}
        total={results.length}
        onPageChange={changePage}
      />
    </div>
  )
}

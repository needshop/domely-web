import { Button, buttonVariants } from '@heroui/react'
import { AlertCircle, CalendarClock, Plus, SearchX, Users, Wallet } from 'lucide-react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { ListPagination } from '@/components/ListPagination'
import { StatTile } from '@/components/StatTile'
import { useTenantRows } from '@/features/tenants/api'
import { TenantCard } from '@/features/tenants/components/TenantCard'
import { TenantsTable } from '@/features/tenants/components/TenantsTable'
import { TenantsToolbar } from '@/features/tenants/components/TenantsToolbar'
import { TENANTS_PAGE_SIZE, useTenantFilters } from '@/features/tenants/hooks/useTenantFilters'
import { LEASE_ENDING_DAYS } from '@/features/contracts/utils'
import { tenantsSummary } from '@/features/tenants/utils'
import { useFormatters } from '@/lib/format'

export function TenantsPage() {
  const { t } = useTranslation()
  const f = useFormatters()
  const rows = useTenantRows()
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
  } = useTenantFilters(rows)
  const summary = tenantsSummary(rows)
  const listTop = useRef<HTMLParagraphElement>(null)

  const changePage = (next: number) => {
    setPage(next)
    // Remonte en haut de la liste pour afficher la nouvelle page
    listTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl">{t('tenants.title')}</h1>
          <p className="mt-1 text-sm text-muted">
            {t('tenants.subtitle', { count: summary.active })}
          </p>
        </div>
        <Link to="/tenants/new" className={buttonVariants({ variant: 'primary' })}>
          <Plus className="size-4" aria-hidden />
          {t('tenants.add')}
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 [&>*]:min-w-0">
        <StatTile
          label={t('tenants.stats.active')}
          value={f.number(summary.active)}
          icon={Users}
          tone="yellow"
          delta={t('tenants.stats.inactive', { count: summary.total - summary.active })}
        />
        <StatTile
          label={t('tenants.stats.late')}
          value={f.number(summary.late)}
          icon={AlertCircle}
          tone="red"
          delta={summary.late === 0 ? t('tenants.stats.allUpToDate') : t('tenants.stats.lateHint')}
        />
        <StatTile
          label={t('tenants.stats.endingSoon')}
          value={f.number(summary.endingSoon)}
          icon={CalendarClock}
          tone="green"
          delta={t('tenants.stats.endingSoonHint', { days: LEASE_ENDING_DAYS })}
        />
        <StatTile
          label={t('tenants.stats.monthlyDue')}
          value={f.money(summary.monthlyDue)}
          icon={Wallet}
          tone="night"
          delta={t('tenants.stats.monthlyDueHint')}
        />
      </section>

      <TenantsToolbar
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
          <p className="font-display">{t('tenants.empty.title')}</p>
          <p className="max-w-sm text-sm text-muted">{t('tenants.empty.description')}</p>
          <Button variant="secondary" size="sm" onPress={reset}>
            {t('tenants.filters.reset')}
          </Button>
        </div>
      ) : (
        <>
          {/* Tableau sur grand écran, cartes sur mobile */}
          <div className="hidden md:block">
            <TenantsTable rows={pageResults} />
          </div>
          <ul className="grid gap-3 md:hidden">
            {pageResults.map((row) => (
              <TenantCard key={row.tenant.id} row={row} />
            ))}
          </ul>
        </>
      )}

      <ListPagination
        page={page}
        pageCount={pageCount}
        pageSize={TENANTS_PAGE_SIZE}
        total={results.length}
        onPageChange={changePage}
      />
    </div>
  )
}

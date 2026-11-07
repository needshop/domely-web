import { Button, buttonVariants } from '@heroui/react'
import { Building2, KeyRound, Percent, Plus, SearchX, Wallet } from 'lucide-react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ListPagination } from '@/components/ListPagination'
import { Link } from 'react-router'
import { StatTile } from '@/components/StatTile'
import { useProperties } from '@/features/properties/api'
import { PropertiesTable } from '@/features/properties/components/PropertiesTable'
import {
  PropertiesToolbar,
  type PropertiesView,
} from '@/features/properties/components/PropertiesToolbar'
import { PropertyCard } from '@/features/properties/components/PropertyCard'
import { PAGE_SIZE, usePropertyFilters } from '@/features/properties/hooks/usePropertyFilters'
import { portfolioStats } from '@/features/properties/utils'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useFormatters } from '@/lib/format'

export function PropertiesPage() {
  const { t } = useTranslation()
  const f = useFormatters()
  const properties = useProperties()
  const {
    filters,
    setFilter,
    reset,
    cities,
    results,
    pageResults,
    page,
    pageCount,
    setPage,
    isFiltered,
  } = usePropertyFilters(properties)
  const listTop = useRef<HTMLParagraphElement>(null)

  const changePage = (next: number) => {
    setPage(next)
    // Remonte en haut de la liste pour afficher la nouvelle page
    listTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const [view, setView] = useLocalStorage<PropertiesView>('domely-properties-view', 'grid')
  const summary = portfolioStats(properties)

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl">{t('properties.title')}</h1>
          <p className="mt-1 text-sm text-muted">
            {t('properties.subtitle', { count: summary.properties })}
          </p>
        </div>
        <Link to="/properties/new" className={buttonVariants({ variant: 'primary' })}>
          <Plus className="size-4" aria-hidden />
          {t('properties.add')}
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 [&>*]:min-w-0">
        <StatTile
          label={t('properties.stats.properties')}
          value={f.number(summary.properties)}
          icon={Building2}
          tone="red"
        />
        <StatTile
          label={t('properties.stats.units')}
          value={f.number(summary.units)}
          icon={KeyRound}
          tone="yellow"
          delta={t('properties.stats.vacant', { count: summary.vacant })}
        />
        <StatTile
          label={t('properties.stats.occupancy')}
          value={f.percent(summary.occupancyRate)}
          icon={Percent}
          tone="green"
          delta={t('properties.stats.rentedOf', { rented: summary.rented, total: summary.units })}
        />
        <StatTile
          label={t('properties.stats.monthlyRent')}
          value={f.money(summary.monthlyRent)}
          icon={Wallet}
          tone="night"
          delta={t('properties.stats.perMonth')}
        />
      </section>

      <PropertiesToolbar
        filters={filters}
        cities={cities}
        view={view}
        isFiltered={isFiltered}
        onFilter={setFilter}
        onReset={reset}
        onViewChange={setView}
      />

      <p ref={listTop} className="-mt-2 scroll-mt-20 text-sm text-muted" aria-live="polite">
        {t('properties.filters.results', { count: results.length })}
      </p>

      {results.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <SearchX className="size-10 text-muted" strokeWidth={1.5} aria-hidden />
          <p className="font-display">{t('properties.empty.title')}</p>
          <p className="max-w-sm text-sm text-muted">{t('properties.empty.description')}</p>
          <Button variant="secondary" size="sm" onPress={reset}>
            {t('properties.filters.reset')}
          </Button>
        </div>
      ) : view === 'table' ? (
        <>
          {/* Sur mobile, le tableau laisse place aux cartes */}
          <div className="hidden sm:block">
            <PropertiesTable rows={pageResults} />
          </div>
          <ul className="grid gap-4 sm:hidden">
            {pageResults.map(({ property, stats }) => (
              <PropertyCard key={property.id} property={property} stats={stats} />
            ))}
          </ul>
        </>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pageResults.map(({ property, stats }) => (
            <PropertyCard key={property.id} property={property} stats={stats} />
          ))}
        </ul>
      )}

      <ListPagination
        page={page}
        pageCount={pageCount}
        pageSize={PAGE_SIZE}
        total={results.length}
        onPageChange={changePage}
      />
    </div>
  )
}

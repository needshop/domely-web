import { Button, buttonVariants } from '@heroui/react'
import { Building2, HandCoins, Plus, SearchX, UsersRound, Wallet } from 'lucide-react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { ListPagination } from '@/components/ListPagination'
import { StatTile } from '@/components/StatTile'
import { useLandlordRows } from '@/features/landlords/api'
import { LandlordCard } from '@/features/landlords/components/LandlordCard'
import { LandlordsTable } from '@/features/landlords/components/LandlordsTable'
import { LandlordsToolbar } from '@/features/landlords/components/LandlordsToolbar'
import {
  LANDLORDS_PAGE_SIZE,
  useLandlordFilters,
} from '@/features/landlords/hooks/useLandlordFilters'
import { landlordsSummary } from '@/features/landlords/utils'
import { useProperties } from '@/features/properties/api'
import { useFormatters } from '@/lib/format'

/** Bailleurs dont l'agence gère les biens (comptes professionnels). */
export function LandlordsPage() {
  const { t } = useTranslation()
  const f = useFormatters()
  const rows = useLandlordRows()
  const properties = useProperties()
  const { filters, setFilter, reset, results, pageResults, page, pageCount, setPage, isFiltered } =
    useLandlordFilters(rows)
  const summary = landlordsSummary(rows, properties)
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
          <h1 className="text-2xl">{t('landlords.title')}</h1>
          <p className="mt-1 text-sm text-muted">{t('landlords.subtitle')}</p>
        </div>
        <Link to="/landlords/new" className={buttonVariants({ variant: 'primary' })}>
          <Plus className="size-4" aria-hidden />
          {t('landlords.add')}
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 [&>*]:min-w-0">
        <StatTile
          label={t('landlords.stats.total')}
          value={f.number(summary.total)}
          icon={UsersRound}
          tone="yellow"
          delta={t('landlords.stats.withoutProperty', { count: summary.withoutProperty })}
        />
        <StatTile
          label={t('landlords.stats.properties')}
          value={f.number(summary.properties)}
          icon={Building2}
          tone="green"
          delta={t('landlords.stats.unassigned', { count: summary.unassigned })}
        />
        <StatTile
          label={t('landlords.stats.monthlyRent')}
          value={f.money(summary.monthlyRent)}
          icon={Wallet}
          tone="night"
          delta={t('landlords.stats.monthlyRentHint')}
        />
        <StatTile
          label={t('landlords.stats.monthlyFees')}
          value={f.money(summary.monthlyFees)}
          icon={HandCoins}
          tone="red"
          delta={t('landlords.stats.monthlyFeesHint')}
        />
      </section>

      <LandlordsToolbar
        filters={filters}
        isFiltered={isFiltered}
        onFilter={setFilter}
        onReset={reset}
      />

      <p ref={listTop} className="-mt-2 scroll-mt-20 text-sm text-muted" aria-live="polite">
        {t('landlords.filters.results', { count: results.length })}
      </p>

      {results.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <SearchX className="size-10 text-muted" strokeWidth={1.5} aria-hidden />
          <p className="font-display">{t('landlords.empty.title')}</p>
          <p className="max-w-sm text-sm text-muted">{t('landlords.empty.description')}</p>
          {isFiltered && (
            <Button variant="secondary" size="sm" onPress={reset}>
              {t('landlords.filters.reset')}
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Tableau sur grand écran, cartes sur mobile */}
          <div className="hidden md:block">
            <LandlordsTable rows={pageResults} />
          </div>
          <ul className="grid gap-3 md:hidden">
            {pageResults.map((row) => (
              <LandlordCard key={row.landlord.id} row={row} />
            ))}
          </ul>
        </>
      )}

      <ListPagination
        page={page}
        pageCount={pageCount}
        pageSize={LANDLORDS_PAGE_SIZE}
        total={results.length}
        onPageChange={changePage}
      />
    </div>
  )
}

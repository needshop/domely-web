import { Button, buttonVariants } from '@heroui/react'
import { CalendarClock, FileSignature, PiggyBank, Plus, SearchX, Wallet } from 'lucide-react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { ListPagination } from '@/components/ListPagination'
import { StatTile } from '@/components/StatTile'
import { useLeaseRows } from '@/features/contracts/api'
import { ContractCard } from '@/features/contracts/components/ContractCard'
import { ContractsTable } from '@/features/contracts/components/ContractsTable'
import { ContractsToolbar } from '@/features/contracts/components/ContractsToolbar'
import {
  CONTRACTS_PAGE_SIZE,
  useContractFilters,
} from '@/features/contracts/hooks/useContractFilters'
import { LEASE_ENDING_DAYS, leasesSummary } from '@/features/contracts/utils'
import { useFormatters } from '@/lib/format'

export function ContractsPage() {
  const { t } = useTranslation()
  const f = useFormatters()
  const rows = useLeaseRows()
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
  } = useContractFilters(rows)
  const summary = leasesSummary(rows)
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
          <h1 className="text-2xl">{t('contracts.title')}</h1>
          <p className="mt-1 text-sm text-muted">
            {t('contracts.subtitle', { count: summary.active })}
          </p>
        </div>
        <Link to="/contracts/new" className={buttonVariants({ variant: 'primary' })}>
          <Plus className="size-4" aria-hidden />
          {t('contracts.add')}
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 [&>*]:min-w-0">
        <StatTile
          label={t('contracts.stats.active')}
          value={f.number(summary.active)}
          icon={FileSignature}
          tone="yellow"
          delta={t('contracts.stats.upcoming', { count: summary.upcoming })}
        />
        <StatTile
          label={t('contracts.stats.endingSoon')}
          value={f.number(summary.endingSoon)}
          icon={CalendarClock}
          tone="red"
          delta={t('tenants.stats.endingSoonHint', { days: LEASE_ENDING_DAYS })}
        />
        <StatTile
          label={t('contracts.stats.monthlyRent')}
          value={f.money(summary.monthlyRent)}
          icon={Wallet}
          tone="night"
          delta={t('contracts.stats.monthlyRentHint')}
        />
        <StatTile
          label={t('contracts.stats.deposits')}
          value={f.money(summary.deposits)}
          icon={PiggyBank}
          tone="green"
          delta={t('contracts.stats.depositsHint')}
        />
      </section>

      <ContractsToolbar
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
          <p className="font-display">{t('contracts.empty.title')}</p>
          <p className="max-w-sm text-sm text-muted">{t('contracts.empty.description')}</p>
          <Button variant="secondary" size="sm" onPress={reset}>
            {t('contracts.filters.reset')}
          </Button>
        </div>
      ) : (
        <>
          {/* Tableau sur grand écran, cartes sur mobile */}
          <div className="hidden md:block">
            <ContractsTable rows={pageResults} />
          </div>
          <ul className="grid gap-3 md:hidden">
            {pageResults.map((row) => (
              <ContractCard key={row.lease.id} row={row} />
            ))}
          </ul>
        </>
      )}

      <ListPagination
        page={page}
        pageCount={pageCount}
        pageSize={CONTRACTS_PAGE_SIZE}
        total={results.length}
        onPageChange={changePage}
      />
    </div>
  )
}

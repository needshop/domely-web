import { Button, Tabs } from '@heroui/react'
import { AlertCircle, CheckCircle2, Hourglass, SearchX, Wallet } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ListPagination } from '@/components/ListPagination'
import { StatTile } from '@/components/StatTile'
import { useRentDues } from '@/features/rents/api'
import { PeriodNavigator } from '@/features/rents/components/PeriodNavigator'
import { RecordPaymentModal } from '@/features/rents/components/RecordPaymentModal'
import { SendReminderModal } from '@/features/rents/components/SendReminderModal'
import { RentCard } from '@/features/rents/components/RentCard'
import { RentsTable } from '@/features/rents/components/RentsTable'
import { RentsToolbar } from '@/features/rents/components/RentsToolbar'
import {
  RENTS_PAGE_SIZE,
  type RentView,
  useRentFilters,
} from '@/features/rents/hooks/useRentFilters'
import type { RentDueRow } from '@/features/rents/types'
import { duesSummary, isOverdue } from '@/features/rents/utils'
import { useFormatters } from '@/lib/format'

export function RentsPage() {
  const { t } = useTranslation()
  const f = useFormatters()
  const rows = useRentDues()
  const {
    view,
    setView,
    period,
    setPeriod,
    thisMonth,
    filters,
    setFilter,
    reset,
    properties,
    scope,
    results,
    pageResults,
    page,
    pageCount,
    setPage,
    isFiltered,
  } = useRentFilters(rows)
  const [collecting, setCollecting] = useState<RentDueRow | null>(null)
  const [reminding, setReminding] = useState<RentDueRow | null>(null)
  // Vue « Impayés » : on relance ; vue du mois : on encaisse
  const action = view === 'unpaid' ? 'remind' : 'collect'
  const onAction = view === 'unpaid' ? setReminding : setCollecting
  const listTop = useRef<HTMLParagraphElement>(null)

  const month = duesSummary(scope)
  const overdue = duesSummary(rows.filter((r) => isOverdue(r.due)))
  const monthLabel = f.monthLong(new Date(`${period}-15T12:00:00`))

  const changePage = (next: number) => {
    setPage(next)
    listTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <header>
        <h1 className="text-2xl">{t('rents.title')}</h1>
        <p className="mt-1 text-sm text-muted">{t('rents.subtitle')}</p>
      </header>

      <Tabs
        variant="secondary"
        selectedKey={view}
        onSelectionChange={(key) => setView(key as RentView)}
        className="w-full"
      >
        <Tabs.ListContainer className="border-b border-separator">
          <Tabs.List aria-label={t('rents.views')}>
            <Tabs.Tab id="month">
              {t('rents.viewMonth')}
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="unpaid">
              {t('rents.viewUnpaid')}
              <span className="ml-1.5 text-xs text-muted tabular-nums">{overdue.overdueCount}</span>
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>

      {view === 'month' ? (
        <>
          <PeriodNavigator period={period} max={thisMonth} onChange={setPeriod} />
          <section className="-mt-2 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 [&>*]:min-w-0">
            <StatTile
              label={t('rents.stats.expected')}
              value={f.money(month.expected)}
              icon={Wallet}
              tone="night"
              delta={t('rents.stats.expectedHint', { count: scope.length })}
            />
            <StatTile
              label={t('rents.stats.collected')}
              value={f.money(month.collected)}
              icon={CheckCircle2}
              tone="green"
              delta={t('rents.stats.collectedHint', { rate: f.percent(month.rate) })}
            />
            <StatTile
              label={t('rents.stats.remaining')}
              value={f.money(month.remaining)}
              icon={Hourglass}
              tone="yellow"
              delta={t('rents.stats.remainingHint', { count: scope.length - month.paidCount })}
            />
            <StatTile
              label={t('rents.stats.overdue')}
              value={f.money(overdue.overdueAmount)}
              icon={AlertCircle}
              tone="red"
              delta={t('rents.stats.overdueHint', { count: overdue.overdueCount })}
            />
          </section>
        </>
      ) : (
        <p className="text-sm text-muted">
          {overdue.overdueCount === 0
            ? t('rents.unpaidNone')
            : t('rents.unpaidSummary', {
                count: overdue.overdueCount,
                amount: f.money(overdue.overdueAmount),
              })}
        </p>
      )}

      <RentsToolbar
        filters={filters}
        properties={properties}
        showStatus={view === 'month'}
        isFiltered={isFiltered}
        onFilter={setFilter}
        onReset={reset}
      />

      <p ref={listTop} className="-mt-2 scroll-mt-20 text-sm text-muted" aria-live="polite">
        {t('tenants.filters.results', { count: results.length })}
      </p>

      {results.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          {view === 'unpaid' && !isFiltered ? (
            <>
              <CheckCircle2 className="size-10 text-success" strokeWidth={1.5} aria-hidden />
              <p className="font-display">{t('rents.empty.allPaidTitle')}</p>
            </>
          ) : (
            <>
              <SearchX className="size-10 text-muted" strokeWidth={1.5} aria-hidden />
              <p className="font-display">
                {isFiltered
                  ? t('rents.empty.title')
                  : t('rents.empty.noDues', { month: monthLabel })}
              </p>
              {isFiltered && (
                <Button variant="secondary" size="sm" onPress={reset}>
                  {t('contracts.filters.reset')}
                </Button>
              )}
            </>
          )}
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <RentsTable
              rows={pageResults}
              showPeriod={view === 'unpaid'}
              action={action}
              onAction={onAction}
            />
          </div>
          <ul className="grid gap-3 md:hidden">
            {pageResults.map((row) => (
              <RentCard key={row.due.id} row={row} action={action} onAction={onAction} />
            ))}
          </ul>
        </>
      )}

      <ListPagination
        page={page}
        pageCount={pageCount}
        pageSize={RENTS_PAGE_SIZE}
        total={results.length}
        onPageChange={changePage}
      />

      <RecordPaymentModal row={collecting} onClose={() => setCollecting(null)} />
      <SendReminderModal row={reminding} onClose={() => setReminding(null)} />
    </div>
  )
}

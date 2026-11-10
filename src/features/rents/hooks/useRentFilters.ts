import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { normalizeSearch } from '@/lib/search'
import type { RentDueRow, RentStatus } from '../types'
import { currentPeriod, isOverdue } from '../utils'

export const rentViews = ['month', 'unpaid'] as const
export type RentView = (typeof rentViews)[number]

export const rentStatusFilters = ['all', 'paid', 'due', 'partial', 'late'] as const
export type RentStatusFilter = (typeof rentStatusFilters)[number]

/** Nombre d'échéances par page. */
export const RENTS_PAGE_SIZE = 10

export interface RentFilters {
  q: string
  status: RentStatusFilter
  property: string
}

const DEFAULTS: RentFilters = { q: '', status: 'all', property: 'all' }

/** Ordre d'affichage du mois : impayés d'abord, puis partiels, à échoir et réglés. */
const statusOrder: Record<RentStatus, number> = { late: 0, partial: 1, due: 2, paid: 3 }

const oneOf = <T extends string>(list: readonly T[], value: string | null, fallback: T): T =>
  value && (list as readonly string[]).includes(value) ? (value as T) : fallback

/**
 * Vue, mois, filtres et page de la liste des loyers, stockés dans l'URL
 * (?view=&period=&q=&status=&property=&page=).
 */
export function useRentFilters(rows: RentDueRow[]) {
  const [params, setParams] = useSearchParams()
  const thisMonth = currentPeriod()

  const view = oneOf(rentViews, params.get('view'), 'month')
  const requestedPeriod = params.get('period') ?? ''
  // Mois affiché : pas au-delà du mois courant (les échéances futures ne sont pas générées)
  const period =
    /^\d{4}-\d{2}$/.test(requestedPeriod) && requestedPeriod <= thisMonth
      ? requestedPeriod
      : thisMonth

  const filters: RentFilters = {
    q: params.get('q') ?? DEFAULTS.q,
    status: oneOf(rentStatusFilters, params.get('status'), DEFAULTS.status),
    property: params.get('property') ?? DEFAULTS.property,
  }

  /** Met à jour des paramètres (valeur par défaut = supprimée) et revient à la page 1. */
  const update = useCallback(
    (changes: Record<string, string>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [key, value] of Object.entries(changes)) {
            const isDefault =
              value === '' ||
              value === 'all' ||
              (key === 'view' && value === 'month') ||
              (key === 'period' && value === thisMonth)
            if (isDefault) next.delete(key)
            else next.set(key, value)
          }
          next.delete('page')
          return next
        },
        { replace: true },
      )
    },
    [setParams, thisMonth],
  )

  const setFilter = useCallback(
    <K extends keyof RentFilters>(key: K, value: RentFilters[K]) => update({ [key]: value }),
    [update],
  )
  // Vue « Impayés » : le filtre de situation n'a plus de sens
  const setView = useCallback((v: RentView) => update({ view: v, status: 'all' }), [update])
  const setPeriod = useCallback((p: string) => update({ period: p }), [update])
  const reset = useCallback(() => update({ q: '', status: 'all', property: 'all' }), [update])

  const setPage = useCallback(
    (page: number) => {
      setParams((prev) => {
        const next = new URLSearchParams(prev)
        if (page <= 1) next.delete('page')
        else next.set('page', String(page))
        return next
      })
    },
    [setParams],
  )

  const properties = useMemo(() => {
    const byId = new Map<string, string>()
    for (const r of rows) if (r.property) byId.set(r.property.id, r.property.name)
    return [...byId]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [rows])

  /** Échéances de la vue (mois choisi, ou tous les impayés), avant filtres. */
  const scope = useMemo(
    () =>
      view === 'unpaid'
        ? rows.filter((r) => isOverdue(r.due))
        : rows.filter((r) => r.due.period === period),
    [rows, view, period],
  )

  const { q, status, property } = filters
  const results = useMemo(() => {
    const query = normalizeSearch(q.trim())
    const filtered = scope.filter((r) => {
      if (property !== 'all' && r.lease.propertyId !== property) return false
      if (view === 'month' && status !== 'all' && r.due.status !== status) return false
      if (query) {
        const haystack = normalizeSearch(
          [r.tenant?.name, r.property?.name, r.unit?.label, r.lease.reference].join(' '),
        )
        if (!haystack.includes(query)) return false
      }
      return true
    })
    return filtered.sort((a, b) =>
      view === 'unpaid'
        ? a.due.dueDate.localeCompare(b.due.dueDate)
        : statusOrder[a.due.status] - statusOrder[b.due.status] ||
          a.due.dueDate.localeCompare(b.due.dueDate) ||
          (a.tenant?.name ?? '').localeCompare(b.tenant?.name ?? ''),
    )
  }, [scope, view, q, status, property])

  const isFiltered = q !== '' || property !== 'all' || (view === 'month' && status !== 'all')

  const pageCount = Math.max(1, Math.ceil(results.length / RENTS_PAGE_SIZE))
  const requestedPage = Number.parseInt(params.get('page') ?? '1', 10)
  const page = Math.min(Math.max(Number.isNaN(requestedPage) ? 1 : requestedPage, 1), pageCount)
  const pageResults = results.slice((page - 1) * RENTS_PAGE_SIZE, page * RENTS_PAGE_SIZE)

  return {
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
  }
}

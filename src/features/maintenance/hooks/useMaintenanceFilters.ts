import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { normalizeSearch } from '@/lib/search'
import {
  type InterventionRow,
  type MaintenanceCategory,
  maintenanceCategories,
  type MaintenancePriority,
  maintenancePriorities,
  type MaintenanceStatus,
  maintenanceStatuses,
} from '../types'
import { isOpen, priorityOrder } from '../utils'

export const maintenanceStatusFilters = ['open', 'all', ...maintenanceStatuses] as const
export type MaintenanceStatusFilter = (typeof maintenanceStatusFilters)[number]

export const maintenanceSortOptions = ['priority', 'recent', 'scheduled'] as const
export type MaintenanceSortOption = (typeof maintenanceSortOptions)[number]

/** Nombre d'interventions par page. */
export const MAINTENANCE_PAGE_SIZE = 10

export interface MaintenanceFilters {
  q: string
  status: MaintenanceStatusFilter
  priority: MaintenancePriority | 'all'
  category: MaintenanceCategory | 'all'
  property: string
  sort: MaintenanceSortOption
}

/** Par défaut : interventions à traiter, les plus urgentes d'abord. */
const DEFAULTS: MaintenanceFilters = {
  q: '',
  status: 'open',
  priority: 'all',
  category: 'all',
  property: 'all',
  sort: 'priority',
}

const oneOf = <T extends string>(list: readonly T[], value: string | null, fallback: T): T =>
  value && (list as readonly string[]).includes(value) ? (value as T) : fallback

/**
 * Filtres de la liste des interventions, stockés dans l'URL
 * (?q=&status=&priority=&category=&property=&sort=&page=).
 */
export function useMaintenanceFilters(rows: InterventionRow[]) {
  const [params, setParams] = useSearchParams()

  const filters: MaintenanceFilters = {
    q: params.get('q') ?? DEFAULTS.q,
    status: oneOf(maintenanceStatusFilters, params.get('status'), DEFAULTS.status),
    priority: oneOf(['all', ...maintenancePriorities], params.get('priority'), DEFAULTS.priority),
    category: oneOf(['all', ...maintenanceCategories], params.get('category'), DEFAULTS.category),
    property: params.get('property') ?? DEFAULTS.property,
    sort: oneOf(maintenanceSortOptions, params.get('sort'), DEFAULTS.sort),
  }

  const setFilter = useCallback(
    <K extends keyof MaintenanceFilters>(key: K, value: MaintenanceFilters[K]) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (value === DEFAULTS[key]) next.delete(key)
          else next.set(key, String(value))
          next.delete('page')
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const reset = useCallback(() => setParams({}, { replace: true }), [setParams])

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

  const { q, status, priority, category, property, sort } = filters
  const results = useMemo(() => {
    const query = normalizeSearch(q.trim())
    const filtered = rows.filter(({ intervention: i, ...r }) => {
      if (status === 'open' && !isOpen(i.status)) return false
      if (status !== 'open' && status !== 'all' && i.status !== (status as MaintenanceStatus))
        return false
      if (priority !== 'all' && i.priority !== priority) return false
      if (category !== 'all' && i.category !== category) return false
      if (property !== 'all' && i.propertyId !== property) return false
      if (query) {
        const haystack = normalizeSearch(
          [
            i.title,
            i.reference,
            i.description,
            i.provider?.name,
            r.property?.name,
            r.unit?.label,
            r.tenant?.name,
          ].join(' '),
        )
        if (!haystack.includes(query)) return false
      }
      return true
    })

    return filtered.sort((a, b) => {
      const x = a.intervention
      const y = b.intervention
      switch (sort) {
        case 'recent':
          return y.reportedAt.localeCompare(x.reportedAt)
        case 'scheduled':
          return (x.scheduledAt ?? '9999').localeCompare(y.scheduledAt ?? '9999')
        default:
          // Les interventions closes passent après celles à traiter
          return (
            Number(!isOpen(x.status)) - Number(!isOpen(y.status)) ||
            priorityOrder[x.priority] - priorityOrder[y.priority] ||
            x.reportedAt.localeCompare(y.reportedAt)
          )
      }
    })
  }, [rows, q, status, priority, category, property, sort])

  const isFiltered =
    q !== DEFAULTS.q ||
    status !== DEFAULTS.status ||
    priority !== DEFAULTS.priority ||
    category !== DEFAULTS.category ||
    property !== DEFAULTS.property

  const pageCount = Math.max(1, Math.ceil(results.length / MAINTENANCE_PAGE_SIZE))
  const requestedPage = Number.parseInt(params.get('page') ?? '1', 10)
  const page = Math.min(Math.max(Number.isNaN(requestedPage) ? 1 : requestedPage, 1), pageCount)
  const pageResults = results.slice(
    (page - 1) * MAINTENANCE_PAGE_SIZE,
    page * MAINTENANCE_PAGE_SIZE,
  )

  return {
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
  }
}

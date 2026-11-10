import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { normalizeSearch } from '@/lib/search'
import { tenantKinds, type TenantKind, type TenantRow } from '../types'
import { isLeaseEndingSoon } from '@/features/contracts/utils'

export const statusFilters = ['all', 'active', 'late', 'endingSoon', 'inactive'] as const
export type StatusFilter = (typeof statusFilters)[number]

export const tenantSortOptions = ['name', 'recent', 'rent', 'leaseEnd'] as const
export type TenantSortOption = (typeof tenantSortOptions)[number]

/** Nombre de locataires par page. */
export const TENANTS_PAGE_SIZE = 10

export interface TenantFilters {
  q: string
  status: StatusFilter
  kind: TenantKind | 'all'
  property: string
  sort: TenantSortOption
}

const DEFAULTS: TenantFilters = { q: '', status: 'all', kind: 'all', property: 'all', sort: 'name' }

const oneOf = <T extends string>(list: readonly T[], value: string | null, fallback: T): T =>
  value && (list as readonly string[]).includes(value) ? (value as T) : fallback

/**
 * Filtres de la liste des locataires, stockés dans l'URL
 * (?q=&status=&kind=&property=&sort=&page=) pour partager ou recharger une recherche.
 */
export function useTenantFilters(rows: TenantRow[]) {
  const [params, setParams] = useSearchParams()

  const filters: TenantFilters = {
    q: params.get('q') ?? '',
    status: oneOf(statusFilters, params.get('status'), 'all'),
    kind: oneOf(['all', ...tenantKinds], params.get('kind'), 'all'),
    property: params.get('property') ?? 'all',
    sort: oneOf(tenantSortOptions, params.get('sort'), 'name'),
  }

  const setFilter = useCallback(
    <K extends keyof TenantFilters>(key: K, value: TenantFilters[K]) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (value === DEFAULTS[key]) next.delete(key)
          else next.set(key, String(value))
          // Un changement de filtre ou de tri ramène à la première page
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

  /** Biens ayant au moins un locataire, pour le filtre « Bien ». */
  const properties = useMemo(() => {
    const byId = new Map<string, string>()
    for (const r of rows) for (const l of r.leases) byId.set(l.property.id, l.property.name)
    return [...byId]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [rows])

  const { q, status, kind, property, sort } = filters
  const results = useMemo(() => {
    const query = normalizeSearch(q.trim())

    const filtered = rows.filter((r) => {
      if (kind !== 'all' && r.tenant.kind !== kind) return false
      if (property !== 'all' && !r.leases.some((l) => l.property.id === property)) return false
      if (status === 'endingSoon') {
        if (!r.nextLeaseEnd || !isLeaseEndingSoon(r.nextLeaseEnd)) return false
      } else if (status === 'active') {
        if (r.status === 'inactive') return false
      } else if (status !== 'all' && r.status !== status) return false
      if (query) {
        const haystack = normalizeSearch(
          [
            r.tenant.name,
            r.tenant.email,
            r.tenant.contactPerson,
            // Recherche par téléphone sans tenir compte des espaces
            r.tenant.phone.replace(/\s+/g, ''),
            ...r.leases.flatMap((l) => [l.property.name, l.unit.label]),
          ].join(' '),
        )
        if (!haystack.includes(query) && !haystack.includes(query.replace(/\s+/g, ''))) {
          return false
        }
      }
      return true
    })

    return filtered.sort((a, b) => {
      switch (sort) {
        case 'recent':
          return b.tenant.createdAt.localeCompare(a.tenant.createdAt)
        case 'rent':
          return b.monthlyDue - a.monthlyDue
        case 'leaseEnd':
          // Sans bail en cours : en fin de liste
          return (a.nextLeaseEnd ?? '9999').localeCompare(b.nextLeaseEnd ?? '9999')
        default:
          return a.tenant.name.localeCompare(b.tenant.name)
      }
    })
  }, [rows, q, status, kind, property, sort])

  const isFiltered = q !== '' || status !== 'all' || kind !== 'all' || property !== 'all'

  // Pagination : page demandée dans l'URL, ramenée dans les bornes
  const pageCount = Math.max(1, Math.ceil(results.length / TENANTS_PAGE_SIZE))
  const requestedPage = Number.parseInt(params.get('page') ?? '1', 10)
  const page = Math.min(Math.max(Number.isNaN(requestedPage) ? 1 : requestedPage, 1), pageCount)
  const pageResults = results.slice((page - 1) * TENANTS_PAGE_SIZE, page * TENANTS_PAGE_SIZE)

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

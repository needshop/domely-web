import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { normalizeSearch } from '@/lib/search'
import { type LeaseRow, type LeaseType, leaseTypes } from '../types'
import { isLeaseEndingSoon, isOccupying } from '../utils'

export const contractStatusFilters = [
  'all',
  'running',
  'endingSoon',
  'upcoming',
  'expired',
  'terminated',
] as const
export type ContractStatusFilter = (typeof contractStatusFilters)[number]

export const contractSortOptions = ['endDate', 'recent', 'rent', 'reference'] as const
export type ContractSortOption = (typeof contractSortOptions)[number]

/** Nombre de contrats par page. */
export const CONTRACTS_PAGE_SIZE = 10

export interface ContractFilters {
  q: string
  status: ContractStatusFilter
  type: LeaseType | 'all'
  property: string
  sort: ContractSortOption
}

/** Par défaut : contrats en cours, échéance la plus proche d'abord. */
const DEFAULTS: ContractFilters = {
  q: '',
  status: 'running',
  type: 'all',
  property: 'all',
  sort: 'endDate',
}

const oneOf = <T extends string>(list: readonly T[], value: string | null, fallback: T): T =>
  value && (list as readonly string[]).includes(value) ? (value as T) : fallback

/**
 * Filtres de la liste des contrats, stockés dans l'URL
 * (?q=&status=&type=&property=&sort=&page=) pour partager ou recharger une recherche.
 */
export function useContractFilters(rows: LeaseRow[]) {
  const [params, setParams] = useSearchParams()

  const filters: ContractFilters = {
    q: params.get('q') ?? DEFAULTS.q,
    status: oneOf(contractStatusFilters, params.get('status'), DEFAULTS.status),
    type: oneOf(['all', ...leaseTypes], params.get('type'), DEFAULTS.type),
    property: params.get('property') ?? DEFAULTS.property,
    sort: oneOf(contractSortOptions, params.get('sort'), DEFAULTS.sort),
  }

  const setFilter = useCallback(
    <K extends keyof ContractFilters>(key: K, value: ContractFilters[K]) => {
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

  const properties = useMemo(() => {
    const byId = new Map<string, string>()
    for (const r of rows) if (r.property) byId.set(r.property.id, r.property.name)
    return [...byId]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [rows])

  const { q, status, type, property, sort } = filters
  const results = useMemo(() => {
    const query = normalizeSearch(q.trim())

    const filtered = rows.filter((r) => {
      if (type !== 'all' && r.lease.type !== type) return false
      if (property !== 'all' && r.lease.propertyId !== property) return false
      switch (status) {
        case 'running':
          if (!isOccupying(r.status)) return false
          break
        case 'endingSoon':
          if (r.status !== 'active' || !isLeaseEndingSoon(r.lease.endDate)) return false
          break
        case 'all':
          break
        default:
          if (r.status !== status) return false
      }
      if (query) {
        const haystack = normalizeSearch(
          [r.lease.reference, r.tenant?.name, r.property?.name, r.unit?.label].join(' '),
        )
        if (!haystack.includes(query)) return false
      }
      return true
    })

    return filtered.sort((a, b) => {
      switch (sort) {
        case 'recent':
          return b.lease.startDate.localeCompare(a.lease.startDate)
        case 'rent':
          return b.lease.rent - a.lease.rent
        case 'reference':
          return a.lease.reference.localeCompare(b.lease.reference)
        default:
          return a.lease.endDate.localeCompare(b.lease.endDate)
      }
    })
  }, [rows, q, status, type, property, sort])

  const isFiltered =
    q !== DEFAULTS.q ||
    status !== DEFAULTS.status ||
    type !== DEFAULTS.type ||
    property !== DEFAULTS.property

  // Pagination : page demandée dans l'URL, ramenée dans les bornes
  const pageCount = Math.max(1, Math.ceil(results.length / CONTRACTS_PAGE_SIZE))
  const requestedPage = Number.parseInt(params.get('page') ?? '1', 10)
  const page = Math.min(Math.max(Number.isNaN(requestedPage) ? 1 : requestedPage, 1), pageCount)
  const pageResults = results.slice((page - 1) * CONTRACTS_PAGE_SIZE, page * CONTRACTS_PAGE_SIZE)

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

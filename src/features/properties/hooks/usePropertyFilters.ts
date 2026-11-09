import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { countrySearchText } from '@/lib/countries'
import { normalizeSearch as normalize } from '@/lib/search'
import { type Property, type PropertyType, propertyTypes } from '../types'
import { propertyStats } from '../utils'

export const occupancyFilters = ['all', 'vacant', 'full'] as const
export type OccupancyFilter = (typeof occupancyFilters)[number]

export const sortOptions = ['recent', 'name', 'rent', 'occupancy'] as const
export type SortOption = (typeof sortOptions)[number]

/** Nombre de biens par page. */
export const PAGE_SIZE = 9

export interface PropertyFilters {
  q: string
  type: PropertyType | 'all'
  city: string
  occupancy: OccupancyFilter
  sort: SortOption
}

const oneOf = <T extends string>(list: readonly T[], value: string | null, fallback: T): T =>
  value && (list as readonly string[]).includes(value) ? (value as T) : fallback

/**
 * Filtres de la liste des biens, stockés dans l'URL (?q=&type=&city=&occupancy=&sort=)
 * pour pouvoir partager ou recharger une recherche.
 */
export function usePropertyFilters(properties: Property[]) {
  const [params, setParams] = useSearchParams()

  const filters: PropertyFilters = {
    q: params.get('q') ?? '',
    type: oneOf(['all', ...propertyTypes], params.get('type'), 'all'),
    city: params.get('city') ?? 'all',
    occupancy: oneOf(occupancyFilters, params.get('occupancy'), 'all'),
    sort: oneOf(sortOptions, params.get('sort'), 'recent'),
  }

  const setFilter = useCallback(
    <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          const isDefault =
            value === '' || value === 'all' || (key === 'sort' && value === 'recent')
          if (isDefault) next.delete(key)
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

  const cities = useMemo(
    () => [...new Set(properties.map((p) => p.address.city))].sort((a, b) => a.localeCompare(b)),
    [properties],
  )

  const { q, type, city, occupancy, sort } = filters
  const results = useMemo(() => {
    const query = normalize(q.trim())
    const withStats = properties.map((p) => ({ property: p, stats: propertyStats(p) }))

    const filtered = withStats.filter(({ property: p, stats }) => {
      if (type !== 'all' && p.type !== type) return false
      if (city !== 'all' && p.address.city !== city) return false
      if (occupancy === 'vacant' && stats.vacant === 0) return false
      if (occupancy === 'full' && stats.rented < stats.units) return false
      if (query) {
        const haystack = normalize(
          [
            p.name,
            p.address.street,
            p.address.district,
            p.address.city,
            countrySearchText(p.address.country),
          ].join(' '),
        )
        if (!haystack.includes(query)) return false
      }
      return true
    })

    return filtered.sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.property.name.localeCompare(b.property.name)
        case 'rent':
          return b.stats.monthlyRent - a.stats.monthlyRent
        case 'occupancy':
          return b.stats.occupancyRate - a.stats.occupancyRate
        default:
          return b.property.createdAt.localeCompare(a.property.createdAt)
      }
    })
  }, [properties, q, type, city, occupancy, sort])

  const isFiltered = q !== '' || type !== 'all' || city !== 'all' || occupancy !== 'all'

  // Pagination : page demandée dans l'URL, ramenée dans les bornes
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const requestedPage = Number.parseInt(params.get('page') ?? '1', 10)
  const page = Math.min(Math.max(Number.isNaN(requestedPage) ? 1 : requestedPage, 1), pageCount)
  const pageResults = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return {
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
  }
}

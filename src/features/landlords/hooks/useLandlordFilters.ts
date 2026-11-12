import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { normalizeSearch } from '@/lib/search'
import { landlordKinds, type LandlordKind, type LandlordRow } from '../types'

export const landlordSortOptions = ['name', 'recent', 'properties', 'rent'] as const
export type LandlordSortOption = (typeof landlordSortOptions)[number]

/** Nombre de bailleurs par page. */
export const LANDLORDS_PAGE_SIZE = 10

export interface LandlordFilters {
  q: string
  kind: LandlordKind | 'all'
  sort: LandlordSortOption
}

const DEFAULTS: LandlordFilters = { q: '', kind: 'all', sort: 'name' }

const oneOf = <T extends string>(list: readonly T[], value: string | null, fallback: T): T =>
  value && (list as readonly string[]).includes(value) ? (value as T) : fallback

/** Filtres de la liste des bailleurs, stockés dans l'URL (?q=&kind=&sort=&page=). */
export function useLandlordFilters(rows: LandlordRow[]) {
  const [params, setParams] = useSearchParams()

  const filters: LandlordFilters = {
    q: params.get('q') ?? '',
    kind: oneOf(['all', ...landlordKinds], params.get('kind'), 'all'),
    sort: oneOf(landlordSortOptions, params.get('sort'), 'name'),
  }

  const setFilter = useCallback(
    <K extends keyof LandlordFilters>(key: K, value: LandlordFilters[K]) => {
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

  const { q, kind, sort } = filters
  const results = useMemo(() => {
    const query = normalizeSearch(q.trim())
    const filtered = rows.filter((r) => {
      if (kind !== 'all' && r.landlord.kind !== kind) return false
      if (query) {
        const haystack = normalizeSearch(
          [
            r.landlord.name,
            r.landlord.contactPerson,
            r.landlord.email,
            r.landlord.city,
            // Recherche par téléphone sans tenir compte des espaces
            r.landlord.phone.replace(/\s+/g, ''),
            ...r.properties.map((p) => p.name),
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
          return b.landlord.createdAt.localeCompare(a.landlord.createdAt)
        case 'properties':
          return b.properties.length - a.properties.length || b.units - a.units
        case 'rent':
          return b.monthlyRent - a.monthlyRent
        default:
          return a.landlord.name.localeCompare(b.landlord.name)
      }
    })
  }, [rows, q, kind, sort])

  const isFiltered = q !== '' || kind !== 'all'

  // Pagination : page demandée dans l'URL, ramenée dans les bornes
  const pageCount = Math.max(1, Math.ceil(results.length / LANDLORDS_PAGE_SIZE))
  const requestedPage = Number.parseInt(params.get('page') ?? '1', 10)
  const page = Math.min(Math.max(Number.isNaN(requestedPage) ? 1 : requestedPage, 1), pageCount)
  const pageResults = results.slice((page - 1) * LANDLORDS_PAGE_SIZE, page * LANDLORDS_PAGE_SIZE)

  return { filters, setFilter, reset, results, pageResults, page, pageCount, setPage, isFiltered }
}

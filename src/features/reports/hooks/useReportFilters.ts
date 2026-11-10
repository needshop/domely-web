import { useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { todayIso } from '@/lib/dates'
import type { ReportPeriod } from '../utils'

/** Périodes proposées : 12 mois glissants, puis l'année en cours et les deux précédentes. */
export function reportPeriods(today = todayIso()): ReportPeriod[] {
  const year = Number(today.slice(0, 4))
  return ['12m', String(year), String(year - 1), String(year - 2)]
}

/** Période et bien analysés, stockés dans l'URL (?period=&property=). */
export function useReportFilters() {
  const [params, setParams] = useSearchParams()
  const periods = reportPeriods()
  const requested = params.get('period') ?? '12m'
  const period = periods.includes(requested) ? requested : '12m'
  const property = params.get('property') ?? 'all'

  const update = useCallback(
    (key: 'period' | 'property', value: string) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          const isDefault = (key === 'period' && value === '12m') || value === 'all'
          if (isDefault) next.delete(key)
          else next.set(key, value)
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  return {
    periods,
    period,
    property,
    setPeriod: (v: string) => update('period', v),
    setProperty: (v: string) => update('property', v),
  }
}

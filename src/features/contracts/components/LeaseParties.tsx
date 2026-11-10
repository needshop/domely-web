import { useTranslation } from 'react-i18next'
import type { LeaseRow } from '../types'

/** Locataire et logement d'un contrat, sur deux lignes. */
export function LeaseTenantCell({ row }: { row: LeaseRow }) {
  const { t } = useTranslation()
  return (
    <div className="min-w-0">
      <p className="truncate">{row.tenant?.name ?? t('contracts.unknownTenant')}</p>
      <p className="truncate text-xs text-muted">
        {row.property?.name ?? '—'} · {row.unit?.label ?? '—'}
      </p>
    </div>
  )
}

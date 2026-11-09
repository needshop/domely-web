import { useTranslation } from 'react-i18next'
import type { TenantLease } from '../types'

/** Logement(s) occupé(s) : le premier bail, puis « + N autres ». */
export function TenantHousing({ leases }: { leases: TenantLease[] }) {
  const { t } = useTranslation()
  const [first, ...others] = leases
  if (!first) return <span className="text-muted">{t('tenants.noLease')}</span>
  return (
    <div className="min-w-0">
      <p className="truncate">{first.property.name}</p>
      <p className="truncate text-xs text-muted">
        {first.unit.label}
        {others.length > 0 && ` · ${t('tenants.otherUnits', { count: others.length })}`}
      </p>
    </div>
  )
}

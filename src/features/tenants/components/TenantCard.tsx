import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useFormatters } from '@/lib/format'
import type { TenantRow } from '../types'
import { TenantAvatar } from './TenantAvatar'
import { TenantHousing } from './TenantHousing'
import { TenantStatusChip } from './TenantStatusChip'

/** Locataire en carte compacte (liste mobile). */
export function TenantCard({ row }: { row: TenantRow }) {
  const { t } = useTranslation()
  const f = useFormatters()
  const { tenant } = row

  return (
    <li>
      <Link
        to={`/tenants/${tenant.id}`}
        aria-label={t('tenants.card.open', { name: tenant.name })}
        className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-surface outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <div className="flex items-start gap-3">
          <TenantAvatar tenant={tenant} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display">{tenant.name}</p>
            <p className="truncate text-xs text-muted tabular-nums">{tenant.phone}</p>
          </div>
          <TenantStatusChip status={row.status} />
        </div>
        <div className="flex items-end justify-between gap-3 text-sm">
          <TenantHousing leases={row.leases} />
          {row.monthlyDue > 0 && (
            <p className="shrink-0 text-right">
              <span className="font-semibold tabular-nums">{f.money(row.monthlyDue)}</span>
              <span className="block text-xs text-muted">{t('tenants.perMonth')}</span>
            </p>
          )}
        </div>
      </Link>
    </li>
  )
}

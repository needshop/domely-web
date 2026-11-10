import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { useFormatters } from '@/lib/format'
import type { TenantRow } from '../types'
import { LeaseEnd } from '@/features/contracts/components/LeaseEnd'
import { TenantAvatar } from './TenantAvatar'
import { TenantHousing } from './TenantHousing'
import { TenantStatusChip } from './TenantStatusChip'

export function TenantsTable({ rows }: { rows: TenantRow[] }) {
  const { t } = useTranslation()
  const f = useFormatters()
  const navigate = useNavigate()

  return (
    <div className="relative overflow-x-auto rounded-2xl border border-border bg-surface shadow-surface">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="text-xs text-muted">
          <tr className="border-b border-separator">
            <th className="px-4 py-3 font-normal">{t('tenants.table.tenant')}</th>
            <th className="px-4 py-3 font-normal">{t('tenants.table.contact')}</th>
            <th className="px-4 py-3 font-normal">{t('tenants.table.housing')}</th>
            <th className="px-4 py-3 text-right font-normal">{t('tenants.table.monthly')}</th>
            <th className="px-4 py-3 font-normal">{t('tenants.table.leaseEnd')}</th>
            <th className="px-4 py-3 font-normal">{t('tenants.table.status')}</th>
            <th className="w-10 px-4 py-3">
              <span className="sr-only">{t('tenants.table.actions')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const { tenant } = row
            const href = `/tenants/${tenant.id}`
            return (
              <tr
                key={tenant.id}
                onClick={() => void navigate(href)}
                className="cursor-pointer border-b border-separator transition-colors last:border-0 hover:bg-default-soft"
              >
                <td className="max-w-64 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <TenantAvatar tenant={tenant} size="sm" />
                    <div className="min-w-0">
                      {/* Le lien porte la navigation clavier / lecteur d'écran ; la ligne entière est cliquable */}
                      <Link
                        to={href}
                        onClick={(e) => e.stopPropagation()}
                        className="block truncate font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-focus"
                      >
                        {tenant.name}
                      </Link>
                      <p className="truncate text-xs text-muted">
                        {tenant.occupation ?? t(`tenants.kind.${tenant.kind}`)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="max-w-56 px-4 py-3">
                  <p className="whitespace-nowrap tabular-nums">{tenant.phone}</p>
                  <p className="truncate text-xs text-muted">{tenant.email ?? '—'}</p>
                </td>
                <td className="max-w-52 px-4 py-3">
                  <TenantHousing leases={row.leases} />
                </td>
                <td className="px-4 py-3 text-right font-semibold whitespace-nowrap tabular-nums">
                  {row.monthlyDue ? f.money(row.monthlyDue) : '—'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <LeaseEnd date={row.nextLeaseEnd} />
                </td>
                <td className="px-4 py-3">
                  <TenantStatusChip status={row.status} />
                </td>
                <td className="px-4 py-3 text-muted">
                  <ChevronRight className="size-4" aria-hidden />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

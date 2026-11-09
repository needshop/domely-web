import { Chip } from '@heroui/react'
import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useTenantNames } from '@/features/tenants/api'
import { useFormatters } from '@/lib/format'
import type { Unit, UnitStatus } from '../types'

const statusColor: Record<UnitStatus, 'success' | 'warning' | 'default'> = {
  rented: 'success',
  vacant: 'warning',
  underWorks: 'default',
}

export function PropertyUnitsTable({ units }: { units: Unit[] }) {
  const { t } = useTranslation()
  const f = useFormatters()
  const tenantName = useTenantNames()
  const hasFloors = units.some((u) => u.floor !== undefined)
  const hasRooms = units.some((u) => u.rooms !== undefined)

  const floorLabel = (floor?: number) =>
    floor === undefined
      ? t('properties.detail.units.none')
      : floor === 0
        ? t('properties.detail.units.groundFloor')
        : floor === 1
          ? t('properties.detail.units.floorFirst')
          : t('properties.detail.units.floorN', { n: floor })

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="text-xs text-muted">
          <tr className="border-b border-separator">
            <th className="px-3 py-2.5 font-normal">{t('properties.detail.units.label')}</th>
            {hasFloors && (
              <th className="px-3 py-2.5 font-normal">{t('properties.detail.units.floor')}</th>
            )}
            <th className="px-3 py-2.5 text-right font-normal">
              {t('properties.detail.units.area')}
            </th>
            {hasRooms && (
              <th className="px-3 py-2.5 text-right font-normal">
                {t('properties.detail.units.rooms')}
              </th>
            )}
            <th className="px-3 py-2.5 text-right font-normal">
              {t('properties.detail.units.rent')}
            </th>
            <th className="px-3 py-2.5 font-normal">{t('properties.detail.units.status')}</th>
            <th className="px-3 py-2.5 font-normal">{t('properties.detail.units.tenant')}</th>
          </tr>
        </thead>
        <tbody>
          {units.map((u) => (
            <tr key={u.id} className="border-b border-separator last:border-0">
              <td className="px-3 py-3">
                <p className="font-medium">{u.label}</p>
                <p className="text-xs text-muted">{t(`properties.unitKind.${u.kind}`)}</p>
              </td>
              {hasFloors && <td className="px-3 py-3 text-muted">{floorLabel(u.floor)}</td>}
              <td className="px-3 py-3 text-right tabular-nums">{f.number(u.area)} m²</td>
              {hasRooms && (
                <td className="px-3 py-3 text-right tabular-nums">
                  {u.rooms ?? t('properties.detail.units.none')}
                </td>
              )}
              <td className="px-3 py-3 text-right">
                <p className="font-semibold tabular-nums">{f.money(u.rent)}</p>
                <p className="text-xs text-muted tabular-nums">
                  {t('properties.detail.units.charges', { amount: f.money(u.charges) })}
                </p>
              </td>
              <td className="px-3 py-3">
                <Chip size="sm" variant="soft" color={statusColor[u.status]}>
                  {t(`properties.unitStatus.${u.status}`)}
                </Chip>
              </td>
              <td className="px-3 py-3">
                {u.lease ? (
                  <>
                    <p className="flex items-center gap-1.5 font-medium">
                      <Link
                        to={`/tenants/${u.lease.tenantId}`}
                        className="outline-none hover:underline focus-visible:ring-2 focus-visible:ring-focus"
                      >
                        {tenantName(u.lease.tenantId) ?? '—'}
                      </Link>
                      {u.isLate && (
                        <AlertTriangle
                          className="size-3.5 shrink-0 text-danger"
                          aria-label={t('properties.detail.units.late')}
                        />
                      )}
                    </p>
                    <p className="text-xs text-muted">
                      {t('properties.detail.units.leaseEnd', {
                        date: f.dayMonthYear(new Date(`${u.lease.endDate}T12:00:00`)),
                      })}
                    </p>
                  </>
                ) : (
                  <span className="text-muted">{t('properties.detail.units.none')}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

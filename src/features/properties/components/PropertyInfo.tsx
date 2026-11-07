import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useFormatters } from '@/lib/format'
import type { Property, PropertyStats } from '../types'

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:gap-6">
      <dt className="text-sm text-muted sm:w-48 sm:shrink-0">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  )
}

export function PropertyInfo({ property: p, stats }: { property: Property; stats: PropertyStats }) {
  const { t } = useTranslation()
  const f = useFormatters()
  const date = (iso: string) => f.dayMonthYear(new Date(`${iso}T12:00:00`))

  return (
    <dl className="divide-y divide-separator">
      <Item label={t('properties.detail.info.type')}>{t(`properties.type.${p.type}`)}</Item>
      <Item label={t('properties.detail.info.address')}>
        {p.address.street}
        <br />
        {p.address.district}, {p.address.city} — {p.address.country}
      </Item>
      <Item label={t('properties.detail.info.units')}>{stats.units}</Item>
      <Item label={t('properties.detail.info.totalArea')}>{f.number(stats.totalArea)} m²</Item>
      <Item label={t('properties.detail.info.acquiredAt')}>{date(p.acquiredAt)}</Item>
      <Item label={t('properties.detail.info.createdAt')}>{date(p.createdAt)}</Item>
      <Item label={t('properties.detail.info.description')}>
        {p.description ?? (
          <span className="text-muted">{t('properties.detail.info.noDescription')}</span>
        )}
      </Item>
    </dl>
  )
}

import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useCountryName } from '@/lib/countries'
import { useFormatters } from '@/lib/format'
import type { Landlord } from '../types'

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-sm break-words">{children}</dd>
    </div>
  )
}

const linkClass =
  'outline-none hover:underline focus-visible:ring-2 focus-visible:ring-focus rounded-sm'

/** Coordonnées du bailleur et conditions du mandat de gestion. */
export function LandlordContact({ landlord: l }: { landlord: Landlord }) {
  const { t } = useTranslation()
  const f = useFormatters()
  const countryName = useCountryName()
  const none = <span className="text-muted">—</span>
  const residence = [l.city, l.country && countryName(l.country)].filter(Boolean).join(', ')

  return (
    <dl className="divide-y divide-separator">
      {l.kind === 'company' && (
        <Item label={t('landlords.fields.contactPerson')}>{l.contactPerson ?? none}</Item>
      )}
      <Item label={t('landlords.fields.phone')}>
        <a href={`tel:${l.phone.replace(/\s+/g, '')}`} className={`${linkClass} tabular-nums`}>
          {l.phone}
        </a>
      </Item>
      <Item label={t('landlords.fields.email')}>
        <a href={`mailto:${l.email}`} className={linkClass}>
          {l.email}
        </a>
      </Item>
      <Item label={t('landlords.fields.residence')}>{residence || none}</Item>
      <Item label={t('landlords.fields.mandateStart')}>
        {l.mandateStart ? f.dayMonthYear(new Date(`${l.mandateStart}T12:00:00`)) : none}
      </Item>
      <Item label={t('landlords.fields.feeRate')}>
        {l.feeRate !== undefined ? t('landlords.feeRateLong', { rate: f.number(l.feeRate) }) : none}
      </Item>
      <Item label={t('landlords.fields.notes')}>
        {l.notes ?? <span className="text-muted">{t('landlords.detail.noNotes')}</span>}
      </Item>
    </dl>
  )
}

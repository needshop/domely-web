import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { Tenant } from '../types'

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

/** Coordonnées et informations administratives du locataire. */
export function TenantContact({ tenant }: { tenant: Tenant }) {
  const { t } = useTranslation()
  const none = <span className="text-muted">—</span>
  const isCompany = tenant.kind === 'company'

  return (
    <dl className="divide-y divide-separator">
      <Item label={t('tenants.detail.contact.phone')}>
        <a href={`tel:${tenant.phone.replace(/\s+/g, '')}`} className={`${linkClass} tabular-nums`}>
          {tenant.phone}
        </a>
      </Item>
      <Item label={t('tenants.detail.contact.email')}>
        {tenant.email ? (
          <a href={`mailto:${tenant.email}`} className={linkClass}>
            {tenant.email}
          </a>
        ) : (
          none
        )}
      </Item>
      <Item
        label={
          isCompany ? t('tenants.detail.contact.activity') : t('tenants.detail.contact.occupation')
        }
      >
        {tenant.occupation ?? none}
      </Item>
      {isCompany && (
        <Item label={t('tenants.detail.contact.contactPerson')}>
          {tenant.contactPerson ?? none}
        </Item>
      )}
      <Item label={t('tenants.detail.contact.idDocument')}>
        {tenant.idDocument ? (
          <>
            {t(`tenants.idDocument.${tenant.idDocument.type}`)}
            <span className="block text-xs text-muted tabular-nums">
              {tenant.idDocument.number}
            </span>
          </>
        ) : (
          none
        )}
      </Item>
      {!isCompany && (
        <Item label={t('tenants.detail.contact.emergency')}>
          {tenant.emergencyContact ? (
            <>
              {tenant.emergencyContact.name}
              <span className="text-muted">
                {' '}
                · {t(`tenants.relation.${tenant.emergencyContact.relation}`)}
              </span>
              <a
                href={`tel:${tenant.emergencyContact.phone.replace(/\s+/g, '')}`}
                className={`${linkClass} block text-xs tabular-nums`}
              >
                {tenant.emergencyContact.phone}
              </a>
            </>
          ) : (
            none
          )}
        </Item>
      )}
      <Item label={t('tenants.detail.contact.notes')}>
        {tenant.notes ?? <span className="text-muted">{t('tenants.detail.contact.noNotes')}</span>}
      </Item>
    </dl>
  )
}

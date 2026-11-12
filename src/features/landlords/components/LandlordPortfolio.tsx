import { useTranslation } from 'react-i18next'
import type { LandlordRow } from '../types'

/** Résumé des biens confiés : « 2 biens · 14 lots », ou « Aucun bien ». */
export function LandlordPortfolio({ row }: { row: LandlordRow }) {
  const { t } = useTranslation()
  if (row.properties.length === 0) {
    return <span className="text-sm text-muted">{t('landlords.noProperty')}</span>
  }
  return (
    <span className="min-w-0">
      <span className="block truncate text-sm">
        {t('landlords.propertiesCount', { count: row.properties.length })}
        <span className="text-muted"> · {t('landlords.unitsCount', { count: row.units })}</span>
      </span>
      <span className="block truncate text-xs text-muted">
        {row.properties.map((p) => p.name).join(', ')}
      </span>
    </span>
  )
}

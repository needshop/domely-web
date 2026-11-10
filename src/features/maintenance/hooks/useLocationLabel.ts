import { useTranslation } from 'react-i18next'
import type { InterventionRow } from '../types'

/** Logement concerné : « Bien · Lot » ou « Bien · Parties communes ». */
export function useLocationLabel() {
  const { t } = useTranslation()
  return (row: InterventionRow) =>
    `${row.property?.name ?? '—'} · ${row.unit?.label ?? t('maintenance.commonAreas')}`
}

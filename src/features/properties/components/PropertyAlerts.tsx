import { Chip } from '@heroui/react'
import { useTranslation } from 'react-i18next'
import type { PropertyStats } from '../types'

/** Pastilles d'alerte d'un bien : lots vacants, loyers en retard. */
export function PropertyAlerts({ stats }: { stats: PropertyStats }) {
  const { t } = useTranslation()
  if (!stats.vacant && !stats.lateCount) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {stats.vacant > 0 && (
        <Chip size="sm" variant="soft" color="warning">
          {t('properties.card.vacant', { count: stats.vacant })}
        </Chip>
      )}
      {stats.lateCount > 0 && (
        <Chip size="sm" variant="soft" color="danger">
          {t('properties.card.late', { count: stats.lateCount })}
        </Chip>
      )}
    </div>
  )
}

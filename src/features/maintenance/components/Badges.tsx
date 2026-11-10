import { Chip } from '@heroui/react'
import { AlertTriangle, ArrowDown, Minus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { MaintenancePriority, MaintenanceStatus } from '../types'
import { statusVisual } from '../visual'

export function MaintenanceStatusChip({ status }: { status: MaintenanceStatus }) {
  const { t } = useTranslation()
  const { color, icon: Icon } = statusVisual[status]
  return (
    <Chip size="sm" variant="soft" color={color}>
      <Icon className="size-3.5" aria-hidden />
      {t(`maintenance.status.${status}`)}
    </Chip>
  )
}

/** Priorité : seule l'urgence est mise en avant (chip rouge) ; les autres restent en texte. */
export function PriorityBadge({ priority }: { priority: MaintenancePriority }) {
  const { t } = useTranslation()
  if (priority === 'urgent') {
    return (
      <Chip size="sm" variant="soft" color="danger">
        <AlertTriangle className="size-3.5" aria-hidden />
        {t('maintenance.priority.urgent')}
      </Chip>
    )
  }
  const Icon = priority === 'low' ? ArrowDown : Minus
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted">
      <Icon className="size-3.5" aria-hidden />
      {t(`maintenance.priority.${priority}`)}
    </span>
  )
}

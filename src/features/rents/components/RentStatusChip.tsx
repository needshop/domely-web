import { Chip } from '@heroui/react'
import { AlertTriangle, CheckCircle2, CircleDashed, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { RentStatus } from '../types'

const config = {
  paid: { color: 'success', icon: CheckCircle2 },
  due: { color: 'default', icon: Clock },
  partial: { color: 'warning', icon: CircleDashed },
  late: { color: 'danger', icon: AlertTriangle },
} as const

/** Situation d'une échéance : toujours une icône et un libellé, jamais la couleur seule. */
export function RentStatusChip({
  status,
  daysLate = 0,
}: {
  status: RentStatus
  daysLate?: number
}) {
  const { t } = useTranslation()
  const { color, icon: Icon } = config[status]
  return (
    <div className="flex flex-col items-start gap-0.5">
      <Chip size="sm" variant="soft" color={color}>
        <Icon className="size-3.5" aria-hidden />
        {t(`rents.status.${status}`)}
      </Chip>
      {daysLate > 0 && (
        <span className="text-xs text-danger tabular-nums">
          {t('rents.daysLate', { count: daysLate })}
        </span>
      )}
    </div>
  )
}
